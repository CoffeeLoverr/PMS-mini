import { useState } from 'react';
import { Outlet, NavLink, useMatch } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import TaskFormModal from '../components/TaskFormModal';
import '../styles/style.css';

export default function Layout() {
  const match   = useMatch('/board/:id');
  const boardId = match?.params.id;

  const queryClient = useQueryClient();

  const [isModalOpen, setModalOpen] = useState(false);
  const [editData, setEditData]     = useState({});

  const createTask = useMutation({
    mutationFn: task => axios.post('http://localhost:8080/api/v1/tasks', task),
    onSuccess: () => {
      
      queryClient.invalidateQueries(['tasks']);
      queryClient.refetchQueries(['tasks'], { active: true });
      
      if (boardId) {
        queryClient.invalidateQueries(['board', boardId]);
        queryClient.refetchQueries(['board', boardId], { active: true });
      }
      setModalOpen(false);
    }
  });

  const updateTask = useMutation({
    mutationFn: task => axios.put(`http://localhost:8080/api/v1/tasks/${task.id}`, task),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
      queryClient.refetchQueries(['tasks'], { active: true });
      if (boardId) {
        queryClient.invalidateQueries(['board', boardId]);
        queryClient.refetchQueries(['board', boardId], { active: true });
      }
      setModalOpen(false);
    }
  });

  const openModal = (task = {}) => {
    setEditData({ ...task, projectId: task.projectId || boardId });
    setModalOpen(true);
  };
  const closeModal = () => setModalOpen(false);

  const handleSubmit = (formData) => {
    if (formData.id) updateTask.mutate(formData);
    else             createTask.mutate(formData);
  };

  const linkStyle = ({ isActive }) => ({
    color: 'black',
    fontWeight: isActive ? 'bold' : 'normal',
    textDecoration: 'none'
  });

  return (
    <>
      <header style={{ background: '#D9DBE8', padding: '12px' }}>
        <nav style={{ display: 'flex', gap: '1rem' }}>
          <NavLink to="/issues" style={linkStyle}>Все задачи</NavLink>
          <NavLink to="/boards" style={linkStyle}>Проекты</NavLink>
          <button
            type="button"
            className="button"
            style={{ marginLeft: 'auto' }}
            onClick={() => openModal()}
          >
            Создать задачу
          </button>
        </nav>
      </header>

      <main style={{ padding: '1rem' }}>
        <Outlet context={{ openModal }} />
      </main>

      <TaskFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        initialData={editData}
      />
    </>
  );
}
