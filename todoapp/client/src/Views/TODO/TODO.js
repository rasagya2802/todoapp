import { useEffect, useState } from 'react';
import Styles from './TODO.module.css';
import axios from 'axios';

export function TODO(props) {
    const [newTodo, setNewTodo] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [todoData, setTodoData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [editTodo, setEditTodo] = useState({ title: '', description: '', _id: '' });

    useEffect(() => {
        const fetchTodo = async () => {
            const apiData = await getTodo();
            setTodoData(apiData);
            setLoading(false);
        };
        fetchTodo();
    }, []);

    const getTodo = async () => {
        const options = {
            method: "GET",
            url: `http://localhost:8000/api/todo`,
            headers: {
                accept: "application/json",
            }
        };
        try {
            const response = await axios.request(options);
            return response.data;
        } catch (err) {
            console.log(err);
            return []; // return an empty array in case of error
        }
    };

    const addTodo = () => {
        const options = {
            method: "POST",
            url: `http://localhost:8000/api/todo`,
            headers: {
                accept: "application/json",
            },
            data: {
                title: newTodo,
                description: newDescription
            }
        };
        axios
            .request(options)
            .then(function (response) {
                console.log(response.data);
                setTodoData(prevData => [...prevData, response.data.newTodo]);
                setNewTodo('');
                setNewDescription('');
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const deleteTodo = (id) => {
        const options = {
            method: "DELETE",
            url: `http://localhost:8000/api/todo/${id}`,
            headers: {
                accept: "application/json",
            }
        };
        axios
            .request(options)
            .then(function (response) {
                console.log(response.data);
                setTodoData(prevData => prevData.filter(todo => todo._id !== id));
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const toggleDone = (id) => {
        const todoToUpdate = todoData.find(todo => todo._id === id);
        const options = {
            method: "PATCH",
            url: `http://localhost:8000/api/todo/${id}`,
            headers: {
                accept: "application/json",
            },
            data: {
                ...todoToUpdate,
                done: !todoToUpdate.done
            }
        };
        axios
            .request(options)
            .then(function (response) {
                console.log(response.data);
                setTodoData(prevData => prevData.map(todo => todo._id === id ? response.data : todo));
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const editTodoItem = (todo) => {
        setEditMode(true);
        setEditTodo({
            title: todo.title,
            description: todo.description,
            _id: todo._id
        });
    };

    const saveTodo = () => {
        const options = {
            method: "PUT",
            url: `http://localhost:8000/api/todo/${editTodo._id}`,
            headers: {
                accept: "application/json",
            },
            data: editTodo
        };
        axios
            .request(options)
            .then(function (response) {
                console.log(response.data);
                setTodoData(prevData => prevData.map(todo => todo._id === editTodo._id ? response.data : todo));
                setEditMode(false);
                setEditTodo({ title: '', description: '', _id: '' });
            })
            .catch((err) => {
                console.log(err);
            });
    };

    return (
        <div className={Styles.ancestorContainer}>
            <div className={Styles.headerContainer}>
                <h1>Tasks</h1>
                <span>
                    <input
                        className={Styles.todoInput}
                        type='text'
                        name='New Todo'
                        placeholder='New Todo'
                        value={newTodo}
                        onChange={(event) => {
                            setNewTodo(event.target.value);
                        }}
                    />
                    <input
                        className={Styles.todoInput}
                        type='text'
                        name='New Description'
                        placeholder='New Description'
                        value={newDescription}
                        onChange={(event) => {
                            setNewDescription(event.target.value);
                        }}
                    />
                    <button
                        id='addButton'
                        name='add'
                        className={Styles.addButton}
                        onClick={addTodo}
                    >
                        + New Todo
                    </button>
                </span>
            </div>
            <div id='todoContainer' className={Styles.todoContainer}>
                {loading ? (
                    <p style={{ color: 'white' }}>Loading...</p>
                ) : (
                    todoData.length > 0 ? (
                        todoData.map((entry) => (
                            <div key={entry._id} className={Styles.todo}>
                                <span className={Styles.infoContainer}>
                                    <input
                                        type='checkbox'
                                        checked={entry.done}
                                        onChange={() => {
                                            toggleDone(entry._id);
                                        }}
                                    />
                                    <div className={Styles.title}>{entry.title}</div>
                                    <div className={Styles.description}>{entry.description}</div>
                                </span>
                                <span
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => {
                                        deleteTodo(entry._id);
                                    }}
                                >
                                    Delete
                                </span>
                                <span
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => {
                                        editTodoItem(entry);
                                    }}
                                >
                                    Edit
                                </span>
                            </div>
                        ))
                    ) : (
                        <p className={Styles.noTodoMessage}>No tasks available. Please add a new task.</p>
                    )
                )}
            </div>
            {editMode && (
                <div className={Styles.editContainer}>
                    <h2>Edit Todo</h2>
                    <input
                        className={Styles.todoInput}
                        type='text'
                        name='Edit Title'
                        placeholder='Edit Title'
                        value={editTodo.title}
                        onChange={(event) => {
                            setEditTodo(prev => ({ ...prev, title: event.target.value }));
                        }}
                    />
                    <input
                        className={Styles.todoInput}
                        type='text'
                        name='Edit Description'
                        placeholder='Edit Description'
                        value={editTodo.description}
                        onChange={(event) => {
                            setEditTodo(prev => ({ ...prev, description: event.target.value }));
                        }}
                    />
                    <button
                        className={Styles.saveButton}
                        onClick={saveTodo}
                    >
                        Save
                    </button>
                    <button
                        className={Styles.cancelButton}
                        onClick={() => {
                            setEditMode(false);
                            setEditTodo({ title: '', description: '', _id: '' });
                        }}
                    >
                        Cancel
                    </button>
                </div>
            )}
        </div>
    );
}
