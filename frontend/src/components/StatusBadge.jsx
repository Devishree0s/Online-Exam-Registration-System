const colors = {
  pending: '#b58900',
  approved: '#1a8a3e',
  rejected: '#c0392b',
  paid: '#1a8a3e',
  failed: '#c0392b',
  refunded: '#666',
};

const StatusBadge = ({ value }) => (
  <span className="badge" style={{ backgroundColor: colors[value] || '#666' }}>
    {value}
  </span>
);

export default StatusBadge;
