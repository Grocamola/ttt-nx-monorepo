// eslint-disable-next-line @typescript-eslint/no-unused-vars
import MainPage from '../components/mainPage/mainPage';
import { Styles } from '@my-org/styles'

// import NxWelcome from './nx-welcome';

export function App() {
  return (
    <div className={Styles()}>
      {/* <NxWelcome title="ttt-nx" /> */}
      <MainPage />
    </div>
  );
}

export default App;
