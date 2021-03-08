// budget_scatter;

json('./data/state_insecure.json')
  .then(x => x.filter(({Year}) => 2012 && Year <= 2018))
  .then(data => myVis(data))
  .catch(e => {
    console.log(e);
    console.log('This SUCKS!');
  });

function myVis(data) {
  const height = 700;
  const width = 700;
  const margin = {top: 60, left: 60, right: 60, bottom: 60};
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;

  const xDim = 'Food Insecurity Rate';
  const yDim = 'State';
}
