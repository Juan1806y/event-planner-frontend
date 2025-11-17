import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import styles from '../../styles/lugares.module.css';

const PlacesList = ({ lugares, onEdit, onDelete }) => {
    return (
        <div className={styles.tableContainer}>
            <table className={styles.lugaresTable}>
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Descripción</th>
                        <th>Ubicación</th>
                        <th>Capacidad</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {lugares.map((lugar) => (
                        <tr key={lugar.id}>
                            <td>{lugar.nombre || 'Sin nombre'}</td>
                            <td>{lugar.descripcion || 'Sin descripción'}</td>
                            <td>{lugar.ubicacion_nombre || 'Sin ubicación'}</td>
                            <td className={styles.capacidadCell}>
                                {lugar.capacidad ? (
                                    <span>{lugar.capacidad}</span>
                                ) : (
                                    <span>-</span>
                                )}
                            </td>
                            <td className={styles.actionsCell}>
                                <button
                                    className={styles.btnIcon}
                                    title="Editar"
                                    onClick={() => onEdit(lugar)}
                                >
                                    <Pencil size={18} />
                                </button>
                                <button
                                    className={`${styles.btnIcon} ${styles.btnDelete}`}
                                    title="Eliminar"
                                    onClick={() => onDelete(lugar)}
                                >
                                    <Trash2 size={18} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default PlacesList;