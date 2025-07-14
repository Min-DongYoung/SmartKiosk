import React from 'react';

interface Column {
  key: string;
  header: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface Action {
  text: string | ((row: any) => string);
  class?: string | ((row: any) => string);
  onClick: (row: any) => void;
}

interface DataTableProps {
  data: any[];
  columns: Column[];
  actions?: Action[];
}

const DataTable: React.FC<DataTableProps> = ({ data, columns, actions = [] }) => {
  if (!data || data.length === 0) {
    return <p className="text-center">데이터가 없습니다.</p>;
  }

  return (
    <div className="table-responsive">
      <table className="table">
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th key={index}>{column.header}</th>
            ))}
            {actions.length > 0 && <th>작업</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((column, colIndex) => (
                <td key={colIndex}>
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </td>
              ))}
              {actions.length > 0 && (
                <td className="d-flex gap-1">
                  {actions.map((action, actionIndex) => {
                    const buttonText = typeof action.text === 'function' ? action.text(row) : action.text;
                    const buttonClass = typeof action.class === 'function' ? action.class(row) : action.class;
                    return (
                      <button
                        key={actionIndex}
                        className={`btn btn-sm ${buttonClass || 'btn-primary'}`}
                        onClick={() => action.onClick(row)}
                      >
                        {buttonText}
                      </button>
                    );
                  })}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
