
const defaultLightDirections = ['0001', '0000', '0007', '0006', '0005', '0004', '0003', '0002'];
const makeResultsTable = ({
    resultsContainer,
    methods,
    cropNames,
    methodsMapping,
    folderName,
    lightDirections=defaultLightDirections,
    initialDirection='0006',
    imageSize=180,
    cropSubfolder=false} = {}) => {
      cropNames.forEach(crop => {
        const row = document.createElement('div');
        row.classList.add('row', 'mb-3');

        row.dataset.crop = crop;
        methods.forEach(method => {
          const col = document.createElement('div');
          col.classList.add('col-md', 'result-cell');
          col.style.maxWidth = `${imageSize}px`;
          col.style.flex = `1 0 ${imageSize}px`;

          // Create imgContainer
          const imgContainer = document.createElement('div');
          imgContainer.classList.add('img-container');
          imgContainer.style.height = `${imageSize}px`;
          // Preload images
          lightDirections.forEach(dir => {
            const img = document.createElement('img');
            if (cropSubfolder) {
              img.src = `${folderName}/${method}/${crop}/${dir}.jpg`;
            } else {
              img.src = `${folderName}/${method}/${crop}_${dir}.jpg`;
            }
            img.dataset.dir = dir;
            img.dataset.method = method;
            img.style.opacity = (dir === initialDirection) ? 1 : 0; // Show the first light direction
            imgContainer.appendChild(img);
          });
          // Append imgContainer to col
          col.appendChild(imgContainer);
          // Create label
          const label = document.createElement('div');
          label.classList.add('method-label');
          label.innerText = methodsMapping[method] || method;
  
          // Append label to col
          col.appendChild(label);
          // Add mousemove listener to the entire row
          row.appendChild(col);
  
          col.addEventListener('mousemove', e => {
            const rect = col.getBoundingClientRect();
            const relX = e.clientX - rect.left; // Relative X position within the row
            const index = Math.floor(Math.max((relX / rect.width) * lightDirections.length, 0));
            const selectedDir = lightDirections[Math.min(index, lightDirections.length - 1)];

            resultsContainer.querySelectorAll('.result-cell').forEach(cell => {
                cell.querySelectorAll('img').forEach(img => {
                img.style.opacity = img.dataset.dir === selectedDir ? 1 : 0;
                });
            });
        });
        });
        resultsContainer.appendChild(row);

      });
  }