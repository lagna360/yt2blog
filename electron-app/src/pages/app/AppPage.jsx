import { AppProvider } from '../../context/AppContext';
import MainPage from '../../components/MainPage';

function AppPage() {
  return (
    <AppProvider>
      <MainPage />
    </AppProvider>
  );
}

export default AppPage;
