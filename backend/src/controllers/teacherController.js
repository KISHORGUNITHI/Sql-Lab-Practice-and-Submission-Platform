import pool from '../db/connection.js';

export const createProblem = async (req, res) => {
    const { title, difficulty, description, schema, expectedQuery } = req.body;

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Insert into problems
        const [problemResult] = await connection.execute(
            `INSERT INTO problems (title, description, difficulty) VALUES (?, ?, ?)`,
            [title, description, difficulty]
        );

        const problem_id = problemResult.insertId;

        // 2. Insert schema
        await connection.execute(
            `INSERT INTO problem_schemas (problem_id, schema_sql) VALUES (?, ?)`,
            [problem_id, schema]
        );

        // 3. Insert expected query
        await connection.execute(
            `INSERT INTO problem_answers (problem_id, expected_query) VALUES (?, ?)`,
            [problem_id, expectedQuery]
        );

        await connection.commit();

        res.redirect('/teacher');

    } catch (err) {
        await connection.rollback();
        console.error(err);
        res.status(500).send('Error creating problem');

    } finally {
        connection.release();
    }
};

export const getTeacherDashboard = async (req, res) => {
    try {
        const [rows] = await pool.execute(
            `SELECT problem_id, title, difficulty FROM problems`
        );

        res.render('teacher/dashboard', { problems: rows });

    } catch (err) {
        console.error(err);
        res.status(500).send('Error loading dashboard');
    }
};

export const deleteProblem = async (req, res) => {
    const { id } = req.params;

    try {
        await pool.execute(
            `DELETE FROM problems WHERE problem_id = ?`,
            [id]
        );

        res.redirect('/teacher');

    } catch (err) {
        console.error(err);
        res.status(500).send('Error deleting problem');
    }
};