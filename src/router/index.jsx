import { createBrowserRouter } from 'react-router-dom';
import Layout       from '../components/Layout';
import IssuesPage   from '../pages/Issues';    
import BoardsPage   from '../pages/Boards';     
import BoardPage    from '../pages/BoardPage';  

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <BoardsPage /> },
      { path: 'issues', element: <IssuesPage /> },     
      { path: 'boards', element: <BoardsPage /> },    
      { path: 'board/:id', element: <BoardPage /> }    
    ]
  }
]);
