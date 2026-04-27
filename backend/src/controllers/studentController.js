import pool from "../db/connection.js";

export const studentDashboard = async (req, res) => {
    try {
        const [rows] = await pool.execute(
            `SELECT problem_id, title, difficulty FROM problems`
        );

        res.render("student/dashboard", { problems: rows });

    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading dashboard");
    }
};

export const showProblem = async (req, res) => {
    const { id } = req.params;

    try {
        const [problem_des] = await pool.execute(
            `SELECT problem_id, title, difficulty, description
             FROM problems
             WHERE problem_id = ?`,
            [id]
        );

        const [problem_schema] = await pool.execute(
            `SELECT schema_sql
             FROM problem_schemas
             WHERE problem_id = ?`,
            [id]
        );

        res.render("student/solve-question", {
            problem: problem_des[0],
            schema: problem_schema[0],
            result: null,
            queryText: "",
            executionTime: 0,
            error: null,
            verdict: null
        });

    } catch (err) {
        console.error(err);
        res.status(500).send("Error showing problem");
    }
};

export const runQuery = async (req, res) => {
    const { id } = req.params;
    const { query, action } = req.body;

    try {
        const start = Date.now();

        const lower = query.trim().toLowerCase();

        // Restricted Queries
        if (
            lower.startsWith("drop") ||
            lower.startsWith("delete") ||
            lower.startsWith("truncate") ||
            lower.startsWith("alter") ||
            lower.startsWith("update") ||
            lower.startsWith("insert")
        ) {
            throw new Error("Restricted Query");
        }

        // Run Student Query
        const [studentRows] = await pool.execute(query);

        const end = Date.now();
        const time = end - start;

        let verdict = null;
        let status = "Executed";

        // If Submit Button Clicked
        if (action === "submit") {

            const [answerData] = await pool.execute(
                `SELECT expected_query
                 FROM problem_answers
                 WHERE problem_id = ?`,
                [id]
            );

            if (answerData.length > 0) {

                const expectedQuery = answerData[0].expected_query;

                const [expectedRows] = await pool.execute(expectedQuery);

                const normalize = (rows) => {
                    return rows.map(row => {
                        const sortedObj = {};
                        Object.keys(row)
                            .sort()
                            .forEach(key => {
                                sortedObj[key] = row[key];
                            });
                        return JSON.stringify(sortedObj);
                    }).sort();
                };

                const studentNorm = normalize(studentRows);
                const expectedNorm = normalize(expectedRows);

                const isCorrect =
                    JSON.stringify(studentNorm) ===
                    JSON.stringify(expectedNorm);

                verdict = isCorrect
                    ? "Correct Answer"
                    : "Wrong Answer";

                status = isCorrect
                    ? "Correct"
                    : "Wrong";

            } else {
                verdict = "Answer Key Not Found";
                status = "Pending";
            }

            // Save Submission
            await pool.execute(
                `INSERT INTO submissions(problem_id, submitted_query, status)
                 VALUES (?, ?, ?)`,
                [id, query, status]
            );
        }

        // Reload Problem Data
        const [problem_des] = await pool.execute(
            `SELECT problem_id, title, difficulty, description
             FROM problems
             WHERE problem_id = ?`,
            [id]
        );

        const [problem_schema] = await pool.execute(
            `SELECT schema_sql
             FROM problem_schemas
             WHERE problem_id = ?`,
            [id]
        );

        res.render("student/solve-question", {
            problem: problem_des[0],
            schema: problem_schema[0],
            result: studentRows,
            queryText: query,
            executionTime: time,
            error: null,
            verdict
        });

    } catch (err) {
        try {
            const [problem_des] = await pool.execute(
                `SELECT problem_id, title, difficulty, description
                 FROM problems
                 WHERE problem_id = ?`,
                [id]
            );

            const [problem_schema] = await pool.execute(
                `SELECT schema_sql
                 FROM problem_schemas
                 WHERE problem_id = ?`,
                [id]
            );

            res.render("student/solve-question", {
                problem: problem_des[0],
                schema: problem_schema[0],
                result: null,
                queryText: query,
                executionTime: 0,
                error: err.message,
                verdict: null
            });

        } catch (innerErr) {
            console.error(innerErr);
            res.status(500).send("Internal Server Error");
        }
    }
};