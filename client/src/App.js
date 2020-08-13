import React from 'react';

import Navbar from './components/layout/Navbar';
import Copyright from './components/layout/Copyright';
import Sidebar from './components/layout/Sidebar';

function App() {
  return (
    <>
      <div class="flex flex-col h-screen ">
        <div class="bg-gray-100 flex-1 flex flex-col">
          <Navbar />
          <div class="flex-1 flex flex-row">
            <Sidebar />
            <div class="bg-blue-300 mx-2 flex-auto rounded">content</div>
          </div>
        </div>

        <Copyright />
      </div>
    </>
  );
}

export default App;
