import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MetaphysicalOSDemo } from './pages/MetaphysicalOSDemo';
import { DemoMode } from './modules/sacred-shifter-core';
import { ResonancePortraitDemo } from './pages/demo/ResonancePortraitDemo';
import { CollectiveEventViewer } from './pages/CollectiveEventViewer';
import { EventsHub } from './pages/EventsHub';
import { GuidedSessionPlayer } from './pages/GuidedSessionPlayer';
import { SessionsHub } from './pages/SessionsHub';
import { DocsHub } from './pages/DocsHub';
import UnseenSeriesDemo from './pages/UnseenSeriesDemo';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UnseenSeriesDemo />} />
        <Route path="/unseen" element={<UnseenSeriesDemo />} />
        <Route path="/sessions" element={<SessionsHub />} />
        <Route path="/sessions/:sessionId" element={<GuidedSessionPlayer />} />
        <Route path="/events" element={<EventsHub />} />
        <Route path="/events/:eventId" element={<CollectiveEventViewer />} />
        <Route path="/docs" element={<DocsHub />} />
        <Route path="/demo/sacred-shifter" element={<DemoMode />} />
        <Route path="/demo/portrait" element={<ResonancePortraitDemo />} />
        <Route path="/metaphysical-os" element={<MetaphysicalOSDemo />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
