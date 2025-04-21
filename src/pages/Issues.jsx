import { useState, useMemo } from 'react';
import { useQuery }           from '@tanstack/react-query';
import axios                  from 'axios';
import { useOutletContext }   from 'react-router-dom';
import '../styles/style.css';

export default function TasksPage() {
  const { openModal } = useOutletContext();
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [boardFilter, setBoardFilter]   = useState('');

  const { data: tasksWithBoard = [], isLoading, error } = useQuery({
    queryKey: ['tasksWithBoard'],
    queryFn: async () => {
      const boardsRes = await axios.get('http://localhost:8080/api/v1/boards');
      const boards = Array.isArray(boardsRes.data.data) ? boardsRes.data.data : [];

      const all = await Promise.all(
        boards.map(async b => {
          const res = await axios.get(`http://localhost:8080/api/v1/boards/${b.id}`);
          const boardTasks = Array.isArray(res.data.data) ? res.data.data : [];
          return boardTasks.map(t => ({
            ...t,
            project: { id: b.id, name: b.name }
          }));
        })
      );
      return all.flat();
    }
  });

  const statuses = ['Backlog', 'InProgress', 'Done'];

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return tasksWithBoard
      .filter(t => {
        const inTitle = t.title.toLowerCase().includes(q);
        const inAssignee = t.assignee?.fullName.toLowerCase().includes(q);
        return inTitle || inAssignee;
      })
      .filter(t => (statusFilter ? t.status === statusFilter : true))
      .filter(t => (boardFilter ? t.project.id === Number(boardFilter) : true));
  }, [tasksWithBoard, search, statusFilter, boardFilter]);

  const handleTaskClick = task => {
    openModal({
      ...task,
      projectId: task.project.id
    });
  };

  return (
    <>
      <div className="tools-bar">
        <input
          type="text"
          placeholder="Поиск…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="search-input"
        />
      <div className="filters">
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="filter-select"
        >
          <option value="">Все статусы</option>
          {statuses.map(s => (
            <option key={s} value={s}>
              {s === 'Backlog' ? 'To do' : s === 'InProgress' ? 'In progress' : 'Done'}
            </option>
          ))}
        </select>

        <select
          value={boardFilter}
          onChange={e => setBoardFilter(e.target.value)}
          className="filter-select"
        >
          <option value="">Все доски</option>
          
          {Array.from(
            new Map(
              tasksWithBoard.map(t => [t.project.id, t.project.name])
            ).entries()
          ).map(([id, name]) => (
            <option key={id} value={id}>{name}</option>
          ))}
        </select>

        <button
          type="button"
          className="filter-btn"
          onClick={() => {
            setSearch('');
            setStatusFilter('');
            setBoardFilter('');
          }}
        >
          Сбросить фильтры
        </button>
        </div>
      </div>

      {isLoading && <p>Загрузка задач…</p>}
      {error     && <p style={{ color: 'red' }}>Ошибка загрузки</p>}

      <ul className="list">
        {filtered.map(t => (
          <li
            key={t.id}
            className="list-item"
            onClick={() => handleTaskClick(t)}
            style={{ cursor: 'pointer' }}
          >
            <strong>{t.title}</strong>
          </li>
        ))}
      </ul>

      <div className="footer-tasks">
        <button
          type="button"
          className="button"
          onClick={() => openModal({})}
        >
          Создать задачу
        </button>
      </div>
    </>
  );
}
