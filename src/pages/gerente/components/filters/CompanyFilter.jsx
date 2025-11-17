import React from 'react';

const CompanyFilter = ({ empresas, selectedEmpresa, onChange }) => {
    if (empresas.length === 0) {
        return (
            <div className="filter-group">
                <label className="filter-label">
                    Empresa:
                </label>
                <select className="filter-select" disabled>
                    <option value="">No hay empresas disponibles</option>
                </select>
            </div>
        );
    }

    return (
        <div className="filter-group">
            <label className="filter-label">
                Filtrar por Empresa:
            </label>
            <select
                value={selectedEmpresa}
                onChange={onChange}
                className="filter-select"
            >
                <option value="">Todas las empresas</option>
                {empresas.map((empresa) => (
                    <option key={empresa.id} value={empresa.nombre}>
                        {empresa.nombre}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default CompanyFilter;