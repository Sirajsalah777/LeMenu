export default function LoadingScreen({ message = 'Chargement...' }) {
  return (
    <div className="loading-screen">
      <div className="spinner" />
      <p className="loading-text">{message}</p>
    </div>
  );
}
