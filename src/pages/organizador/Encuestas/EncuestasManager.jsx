import React, { useState, useEffect } from "react";

const BASE_URL = "/api/encuestas";

const EncuestasManager = () => {
    const [encuestas, setEncuestas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [titulo, setTitulo] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [editId, setEditId] = useState(null);

    const cargarEncuestas = async () => {
        try {
            const res = await fetch(BASE_URL);
            const data = await res.json();
            setEncuestas(data);
            setLoading(false);
        } catch (e) {
            setError("Error cargando encuestas");
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarEncuestas();
    }, []);

    const guardarEncuesta = async (e) => {
        e.preventDefault();

        if (!titulo.trim()) return alert("El título es obligatorio");

        const encuesta = { titulo, descripcion };

        try {
            const res = await fetch(editId ? `${BASE_URL}/${editId}` : BASE_URL, {
                method: editId ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(encuesta),
            });

            if (!res.ok) throw new Error("Error al guardar");

            setTitulo("");
            setDescripcion("");
            setEditId(null);
            cargarEncuestas();
        } catch (e) {
            alert("Hubo un error guardando la encuesta");
        }
    };

    const eliminarEncuesta = async (id) => {
        if (!window.confirm("¿Deseas eliminar esta encuesta?")) return;

        try {
            const res = await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error();

            cargarEncuestas();
        } catch {
            alert("Error eliminando la encuesta");
        }
    };


    const editar = (encuesta) => {
        setTitulo(encuesta.titulo);
        setDescripcion(encuesta.descripcion);
        setEditId(encuesta.id);
    };

    if (loading) return <p>Cargando encuestas…</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="p-4">

            <h2>Gestión de Encuestas</h2>

            <form onSubmit={guardarEncuesta} className="mb-4">
                <div>
                    <label>Título:</label>
                    <input
                        type="text"
                        value={titulo}
                        onChange={(e) => setTitulo(e.target.value)}
                    />
                </div>

                <div>
                    <label>Descripción:</label>
                    <textarea
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                    />
                </div>

                <button type="submit">
                    {editId ? "Actualizar" : "Crear"}
                </button>
            </form>

            {/* Tabla */}
            <table border="1" cellPadding="8">
                <thead>
                    <tr>
                        <th>Título</th>
                        <th>Descripción</th>
                        <th>Acciones</th>
                    </tr>
                </thead>

                <tbody>
                    {encuestas.map((e) => (
                        <tr key={e.id}>
                            <td>{e.titulo}</td>
                            <td>{e.descripcion}</td>
                            <td>
                                <button onClick={() => editar(e)}>Editar</button>
                                <button onClick={() => eliminarEncuesta(e.id)}>
                                    Eliminar
                                </button>
                            </td>
                        </tr>
                    ))}

                    {encuestas.length === 0 && (
                        <tr>
                            <td colSpan="3">No hay encuestas registradas</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default EncuestasManager;
