import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../styles/style.css';

export default function ProjectsPage() {
  const { data: boards = [], isLoading, error } = useQuery({
    queryKey: ['boards'],
    queryFn: async () => {
      const res = await axios.get('http://localhost:8080/api/v1/boards');
      return Array.isArray(res.data.data) ? res.data.data : [];
    }
  });

  return (
    <>
      {isLoading && <p>Загрузка задач…</p>}
      {error && <p style={{ color: 'red' }}>Ошибка загрузки</p>}
      <ul className="list">
        {boards.map(b => (
          <li key={b.id} className="list-item">
            <strong>{b.name}</strong>
              <Link to={`/board/${b.id}`} className="button board-btn">
                Перейти к доске
              </Link>
          </li>
        ))}
      </ul>
      </>
  );
}