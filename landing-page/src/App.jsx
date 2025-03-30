import Header from './components/Header';
import MainContent from './components/MainContent';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header />
      <MainContent />
      <Footer />
    </div>
  );
}

export default App;
