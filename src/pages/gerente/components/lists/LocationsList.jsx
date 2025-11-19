import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import styles from '../../styles/ubicaciones.module.css';

const LocationsList = ({ ubicaciones, onEdit, onDelete }) => {
    console.log('📊 Datos de ubicaciones recibidos:', ubicaciones);

    if (ubicaciones.length > 0) {
        console.log('🔍 Estructura completa de la primera ubicación:');
        Object.keys(ubicaciones[0]).forEach(key => {
            console.log(`   ${key}:`, ubicaciones[0][key]);
        });
    }

    const getCiudadNombre = (ubicacion) => {
        return ubicacion.ciudad_nombre ||
            ubicacion.ciudad?.nombre ||
            ubicacion.nombre_ciudad ||
            ubicacion.ciudad ||
            'Sin ciudad';
    };

    const getDescripcion = (ubicacion) => {
        return ubicacion.descripcion ||
            ubicacion.detalles ||
            ubicacion.descripcion_lugar ||
            'Sin descripción';
    };

    return (
        <div className={styles.tableContainer}>
            <table className={styles.ubicacionesTable}>
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Dirección</th>
                        <th>Descripción</th>
                        <th>Ciudad</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {ubicaciones.map((ubicacion, index) => (
                        <tr key={ubicacion.id || index}>
                            <td>{ubicacion.lugar || ubicacion.nombre || ubicacion.lugar_nombre}</td>
                            <td>{ubicacion.direccion || 'Sin dirección'}</td>
                            <td>{getDescripcion(ubicacion)}</td>
                            <td>{getCiudadNombre(ubicacion)}</td>
                            <td className={styles.actionsCell}>
                                <button
                                    className={styles.btnIcon}
                                    title="Editar"
                                    onClick={() => onEdit(ubicacion)}
                                >
                                    <Pencil size={18} />
                                </button>
                                <button
                                    className={`${styles.btnIcon} ${styles.btnDelete}`}
                                    title="Eliminar"
                                    onClick={() => onDelete(ubicacion)}
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

export default LocationsList;