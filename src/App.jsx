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
    setVideoInfo(null);

    try {
      const response = await axios.post('http://localhost:5000/api/info', { url });
      setVideoInfo(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch video information');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    const date = new Date(0);
    date.setSeconds(seconds);
    return date.toISOString().substr(11, 8);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const videoId = getVideoId(url);

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
          YouTube 720p MP4 Downloader
        </h1>

        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste YouTube URL here..."
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="YouTube URL input"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Processing...
                </span>
              ) : 'Check Availability'}
            </button>
          </div>
        </form>

        {error && (
          <div className="p-4 mb-4 bg-red-100 text-red-700 rounded-lg border border-red-200">
            ⚠️ {error}
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
          <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                {videoInfo.title}
              </h2>
              <div className="space-y-1">
                {videoInfo.duration && (
                  <p className="text-gray-600">
                    ⏳ Duration: {formatDuration(videoInfo.duration)}
                  </p>
                )}
                {videoInfo.contentLength && (
                  <p className="text-gray-600">
                    📦 File Size: {formatFileSize(videoInfo.contentLength)}
                  </p>
                )}
              </div>
            </div>

            <div className="text-center">
              <a
                href={`http://localhost:5000/api/download?url=${encodeURIComponent(url)}&itag=${videoInfo.itag}`}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 inline-flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download 720p MP4
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;