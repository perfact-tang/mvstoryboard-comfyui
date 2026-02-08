import React from 'react';
import { Layout } from './components/Layout';
import { Header } from './components/Header';
import { EmptyState } from './components/EmptyState';
import { Dashboard } from './components/Dashboard';
import { JsonInputModal } from './components/JsonInputModal';
import { useStore } from './store/useStore';

function App() {
  const { data } = useStore();

  return (
    <Layout>
      <Header />
      {data ? <Dashboard /> : <EmptyState />}
      <JsonInputModal />
    </Layout>
  );
}

export default App;
