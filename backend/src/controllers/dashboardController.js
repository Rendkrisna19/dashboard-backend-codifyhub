export const getSummary = (req, res) => {
  // nanti diisi data keuangan & client dari database
  res.json({
    clients: 12,
    projects: 8,
    income: 20000000,
    expense: 5000000,
  });
};
