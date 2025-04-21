import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import '../styles/style.css';
import { useOutletContext, NavLink } from 'react-router-dom';


export default function BoardPage() {
  const { openModal } = useOutletContext();
  const { id } = useParams();            
  const idNum  = Number(id);            

  const { data: tasks = [], isLoading, error } = useQuery({
    queryKey: ['board-tasks', idNum],
    queryFn: async () => {
      const res = await axios.get(
        `http://localhost:8080/api/v1/boards/${idNum}`
      );
      return Array.isArray(res.data.data) ? res.data.data : [];
    }
  });

  const { data: boards = [] } = useQuery({
    queryKey: ['boards'],
    queryFn: async () => {
      const res = await axios.get('http://localhost:8080/api/v1/boards');
      return Array.isArray(res.data.data) ? res.data.data : [];
    }
  });

  const boardInfo = boards.find(b => b.id === idNum);
  const boardName = boardInfo ? boardInfo.name : `Доска ${idNum}`;

  if (isLoading) return <p>Загрузка доски…</p>;
  if (error)     return <p style={{ color: 'red' }}>Не удалось загрузить доску</p>;

  const columns = {
    Backlog:    tasks.filter(t => t.status === 'Backlog'),
    InProgress: tasks.filter(t => t.status === 'InProgress'),
    Done:       tasks.filter(t => t.status === 'Done')
  };

  return (
    <>
      <h2 className="board-title">{boardName}</h2>

      <div className="board-grid">
        {['Backlog', 'InProgress', 'Done'].map(col => (
          <div key={col} className="board-column">
            <h3 className="column-title">
                {col === 'Backlog'
                    ? 'To do'
                    : col === 'InProgress'
                        ? 'In progress'
                        : 'Done'}
            </h3>

            {columns[col].map(card => (
              <div
                key={card.id}
                className="card"
                onClick={() => openModal(card)}
                style={{ cursor: 'pointer' }}
              >
                {card.title}
            </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}
