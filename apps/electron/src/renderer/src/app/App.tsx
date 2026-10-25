import { MemoryRouter } from 'react-router'

import { AppWorkspace } from './AppWorkspace'

function App(): React.JSX.Element {
  return (
    <MemoryRouter>
      <AppWorkspace />
    </MemoryRouter>
  )
}

export default App
