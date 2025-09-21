
function convertDateRange(selectFromSession, selectToSession) {
  // Helper function to format date to "MMM DD" format
  function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { month: 'short', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }
  
  // Convert both dates and join with " - "
  const fromFormatted = formatDate(selectFromSession);
  const toFormatted = formatDate(selectToSession);
  
  return `${fromFormatted} - ${toFormatted}`;   
}

module.exports = convertDateRange