const formatTimestamp = (isoString: string) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    timeZoneName: 'short',
  };
  // `toLocaleString` formats the date based on the user's browser settings
  return date.toLocaleString(undefined, options);
};

export { formatTimestamp };
