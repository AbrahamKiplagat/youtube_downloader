import { useState } from 'react';
import axios from 'axios';

function App() {
  const [url, setUrl] = useState('');
  const [videoInfo, setVideoInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url) return;
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/info', { url });
      setVideoInfo(response.data);
    } catch (err) {
      setError(`Failed to fetch video info: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const videoId = getVideoId(url);

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
          YouTube Downloader
        </h1>

        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste YouTube URL here..."
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Fetch Video'}
            </button>
          </div>
        </form>

        {error && (
          <div className="p-4 mb-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {videoId && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="aspect-video rounded-lg overflow-hidden">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                className="w-full h-full"
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {videoInfo && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              {videoInfo.title}
            </h2>

            <h3 className="text-lg font-medium text-gray-700 mb-4">
              Available Formats:
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {videoInfo.formats.map((format, index) => (
                <a
                  key={index}
                  href={`http://localhost:5000/api/download?url=${encodeURIComponent(url)}&quality=${format.quality}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 flex items-center justify-between"
                >
                  <div>
                    <span className="text-gray-600">{format.quality}</span>
                    <span className="ml-2 text-sm text-gray-400">
                      {format.container}
                    </span>
                  </div>
                  <span className="px-3 py-1 bg-green-500 text-white rounded-full text-sm">
                    Download
                  </span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;