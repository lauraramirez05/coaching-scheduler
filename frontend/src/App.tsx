import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { StoreContext } from './stores/StoreContext';
import './index.css';

const App = observer(() => {
  const [count, setCount] = useState(0);

  return (
    <>
      <h1>Vite + React</h1>
      <div className='card'>
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
      </div>
    </>
  );
});

export default App;
