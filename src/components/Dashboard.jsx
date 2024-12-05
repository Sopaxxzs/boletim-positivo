import { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [news, setNews] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    const querySnapshot = await getDocs(collection(db, 'news'));
    const newsData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setNews(newsData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'news'), {
        title,
        content,
        authorId: currentUser.uid,
        createdAt: new Date().toISOString()
      });
      toast.success('Notícia adicionada com sucesso!');
      setTitle('');
      setContent('');
      fetchNews();
    } catch (error) {
      toast.error('Erro ao adicionar notícia: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'news', id));
      toast.success('Notícia deletada com sucesso!');
      fetchNews();
    } catch (error) {
      toast.error('Erro ao deletar notícia: ' + error.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Painel de Notícias Positivas</h1>
      
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Título</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Conteúdo</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              rows="4"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
          >
            Adicionar Notícia
          </button>
        </div>
      </form>

      <div className="space-y-4">
        {news.map((item) => (
          <div key={item.id} className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-xl font-semibold">{item.title}</h3>
            <p className="mt-2 text-gray-600">{item.content}</p>
            <button
              onClick={() => handleDelete(item.id)}
              className="mt-2 text-red-600 hover:text-red-800"
            >
              Deletar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}