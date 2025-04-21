import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useMatch, useNavigate } from 'react-router-dom';
import '../styles/style.css';

export default function TaskFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = {}
}) {
  const navigate = useNavigate();  
  const isOnBoardPage = Boolean(useMatch('/board/:id'));  
  const showGoTo = !isOnBoardPage && Boolean(initialData.id);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [status, setStatus] = useState('Backlog');
  const [assignee, setAssignee] = useState('');
  const [projectId, setProjectId] = useState('');

  const { data: boards = [] } = useQuery({
    queryKey: ['boards'],
    queryFn: async () => {
      const res = await axios.get('http://localhost:8080/api/v1/boards');
      return Array.isArray(res.data.data) ? res.data.data : [];
    }
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await axios.get('http://localhost:8080/api/v1/users');
      return Array.isArray(res.data.data) ? res.data.data : [];
    }
  });

  useEffect(() => {
    if (!isOpen) return;
    setTitle(initialData.title || '');
    setDescription(initialData.description || '');
    setPriority(initialData.priority || 'Medium');
    setStatus(initialData.status || 'Backlog');
    setAssignee(initialData.assignee?.id?.toString() || '');
    setProjectId(initialData.projectId?.toString() || '');
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      id: initialData.id,
      title,
      description,
      priority,
      status,
      assignee: Number(assignee),
      projectId: Number(projectId)
    });
    onClose();
  };

  const handleGoToBoard = () => {
    const pid = initialData.projectId || projectId;
    onClose();
    navigate(`/board/${pid}`);
  };

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>{initialData.id ? 'Редактировать задачу' : 'Создать задачу'}</h2>
        <form onSubmit={handleSubmit} className="task-form">
          {/* Поля формы */}
          <label>
            Название задачи
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </label>
          <label>
            Описание задачи
            <textarea
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </label>
          <label>
            Проект
            <select
              value={projectId}
              onChange={e => setProjectId(e.target.value)}
              disabled={Boolean(initialData.projectId)}
              required
            >
              <option value="">— выбрать проект —</option>
              {boards.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </label>
          <label>
            Приоритет
            <select value={priority} onChange={e => setPriority(e.target.value)}>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </label>
          <label>
            Статус
            <select value={status} onChange={e => setStatus(e.target.value)}>
              <option value="Backlog">Backlog</option>
              <option value="InProgress">In progress</option>
              <option value="Done">Done</option>
            </select>
          </label>
          <label>
            Исполнитель
            <select
              value={assignee}
              onChange={e => setAssignee(e.target.value)}
              required
            >
              <option value="">— не выбран —</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.fullName}</option>
              ))}
            </select>
          </label>

          <div className="form-actions">
            {showGoTo && (
              <button
                type="button"
                className="go-board-btn"
                onClick={handleGoToBoard}
              >
                Перейти на доску
              </button>
            )}
            <button type="submit">
              {initialData.id ? 'Обновить' : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
