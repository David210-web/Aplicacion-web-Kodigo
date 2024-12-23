import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import DataTable from 'react-data-table-component';

const DataTableComida = () => {
    const [comidas, setComidas] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        precio: '',
        calorias: ''
    });
    const [editId, setEditId] = useState(null);
    const [filteredComidas, setFilteredComidas] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost:8080/comidas');
                const data = await response.json();
                console.log(data)
                setComidas(data);
                setFilteredComidas(data);
                setLoading(false);
            } catch (error) {
                console.error('Error al cargar datos', error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleShow = (comida = null) => {
        setShowModal(true);
        if (comida) {
            setFormData({
                nombre: comida.nombre,
                descripcion: comida.descripcion,
                precio: comida.precio,
                calorias: comida.calorias
            });
            setEditId(comida.id);
        } else {
            setFormData({ nombre: '', descripcion: '', precio: '', calorias: '' });
            setEditId(null);
        }
    };

    const handleClose = () => {
        setShowModal(false);
        setFormData({ nombre: '', descripcion: '', precio: '', calorias: '' });
        setEditId(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Validación específica para calorías
        if (name === 'calorias' && value && !/^\d+$/.test(value)) {
            Swal.fire('Error', "Las calorías deben ser un número entero positivo", "error");
            return;
        }

        // Validación específica para precio
        if (name === 'precio' && value && !/^\d+(\.\d{1,2})?$/.test(value)) {
            Swal.fire('Error', "El precio debe ser un número positivo con hasta 2 decimales", "error");
            return;
        }

        setFormData({ ...formData, [name]: value });
    };

    const handleSave = async () => {
        if (!formData.nombre || !formData.descripcion || !formData.precio || !formData.calorias) {
            Swal.fire('Error', "Todos los campos deben ser completados", "error");
            return;
        }

        try {
            const method = editId ? 'PUT' : 'POST';
            const url = editId ? `http://localhost:8080/comidas/${editId}` : 'http://localhost:8080/comidas';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const updatedComida = await response.json();
                if (editId) {
                    // Editando
                    setComidas(comidas.map(comida => comida.id === editId ? updatedComida : comida));
                    setFilteredComidas(comidas.map(comida => comida.id === editId ? updatedComida : comida)); // Actualiza también el filtro
                    Swal.fire('Actualizado', "La comida fue actualizada con éxito", "success");
                } else {
                    // Agregando
                    setComidas([...comidas, updatedComida]);
                    setFilteredComidas([...comidas, updatedComida]); // Actualiza también el filtro
                    Swal.fire('Agregado', "La comida fue agregada con éxito", "success");
                }
                handleClose();
            } else {
                Swal.fire('Error', "Hubo un error al guardar la comida", "error");
            }
        } catch (error) {
            Swal.fire('Error', "Hubo un error en la solicitud", "error");
        }
    };

    const handleSearch = (event) => {
        const searchTerm = event.target.value.toLowerCase();
        setSearchText(searchTerm);

        const filtered = comidas.filter((comida) =>
            comida.nombre.toLowerCase().includes(searchTerm) ||
            comida.descripcion.toLowerCase().includes(searchTerm) ||
            comida.calorias.toLowerCase().includes(searchTerm)
        );
        setFilteredComidas(filtered);
    };

    const handleDelete = async (id) => {
        const confirmResult = await Swal.fire({
            title: '¿Estás seguro de eliminar la comida?',
            text: "No podrás revertir esto!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Si, eliminar!',
            cancelButtonText: "Cancelar"
        });

        if (confirmResult.isConfirmed) {
            try {
                const response = await fetch(`http://localhost:8080/comidas/${id}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    setComidas(comidas.filter(comida => comida.id !== id));
                    setFilteredComidas(filteredComidas.filter(comida => comida.id !== id)); // Actualiza también el filtro
                    Swal.fire('Eliminado', "La comida fue eliminada con éxito", "success");
                } else {
                    console.error('Error al eliminar la comida');
                }
            } catch (error) {
                console.error('Error en la solicitud DELETE', error);
            }
        }
    };

    const columns = [
        {
            name: 'ID Comida',
            selector: (row) => row.id,
            sortable: true,
        },
        {
            name: 'Nombre',
            selector: (row) => row.nombre,
            sortable: true,
        },
        {
            name: 'Descripción',
            selector: (row) => row.descripcion,
            sortable: true,
        },
        {
            name: 'Precio',
            selector: (row) => row.precio,
            sortable: true,
            right: true,
        },
        {
            name: 'Calorias',
            selector: (row) => row.calorias,
            sortable: true,
        },
        {
            name: 'Acciones',
            cell: (row) => (
                <div className="d-flex justify-content-around">
                    <button
                        className="btn btn-warning"
                        onClick={() => handleShow(row)}
                    >
                        Editar
                    </button>
                    <button
                        className="btn btn-danger"
                        onClick={() => handleDelete(row.id)}
                    >
                        Eliminar
                    </button>
                </div>
            ),
        },
    ];

    return (
        <>
            {showModal && (
                <div
                    className="modal fade show"
                    style={{ display: "block", backgroundColor: "rgba(0, 0, 0, 0.5)" }}
                    tabIndex="-1"
                >
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">{editId ? 'Editar Comida' : 'Agregar Comida'}</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={handleClose}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <form>
                                    <div className="mb-3">
                                        <label htmlFor="nombreComida" className="form-label">Nombre comida: </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="nombreComida"
                                            name="nombre"
                                            value={formData.nombre}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="floatingTextarea">Descripción:</label>
                                        <textarea
                                            className="form-control"
                                            placeholder="Escribe una descripción"
                                            id="floatingTextarea"
                                            name="descripcion"
                                            value={formData.descripcion}
                                            onChange={handleInputChange}
                                        ></textarea>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="precioComida" className="form-label">Precio: </label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            id="precioComida"
                                            name="precio"
                                            value={formData.precio}
                                            onChange={handleInputChange}
                                            min={0}
                                            step={0.01}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="caloriasComida" className="form-label">Calorías: </label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            id="caloriasComida"
                                            name="calorias"
                                            value={formData.calorias}
                                            onChange={handleInputChange}
                                            min={"1"}
                                            required
                                        />
                                    </div>
                                </form>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={handleClose}>Cerrar</button>
                                <button type="button" className="btn btn-primary" onClick={handleSave}>Guardar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="container mt-3">
                <h3>Gestión de Comidas</h3>

                {/* Barra de búsqueda */}
                <input
                    type="text"
                    className="form-control mb-3"
                    placeholder="Buscar..."
                    value={searchText}
                    onChange={handleSearch}
                />

                {/* Tabla de datos */}
                <DataTable
                    title="Comidas"
                    columns={columns}
                    data={filteredComidas}
                    pagination
                    progressPending={loading}
                    highlightOnHover
                />

                {/* Botón para agregar comida */}
                <button className="btn btn-primary" onClick={() => handleShow()}>Agregar Comida</button>
            </div>
        </>
    );
};

export default DataTableComida;
