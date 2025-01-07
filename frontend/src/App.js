import './App.css';
import  Entries from './components/Entries.tsx';

function App() {
  return (
    <div className="App">
        <h1> What I Played </h1>
      <header className="App-header">
            <Entries/>
      </header>
    </div>
  );
}

export default App;
