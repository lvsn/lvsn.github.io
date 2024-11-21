const makeResultsTable2 = ({
    resultsContainer,
    azimuthSlider=null,
    azimuthValueText=null,
    parameterSlider=null,
    parameterValueText=null,
    methods,
    initialMethod='shadow_comp_v2_default_post_color_balanced_denoised',
    cropNames,
    methodsMapping,
    folderName,
    lightDirections=defaultLightDirections,
    initialDirection='0000',
    cropSubfolder=false} = {}) => {
      const row = document.createElement('div');
      cropNames.forEach(crop => {
        row.classList.add('row', 'mb-3');

        row.dataset.crop = crop;

        const col = document.createElement('div');
        col.classList.add('col-md', 'result-cell');

        // Create imgContainer
        const imgContainer = document.createElement('div');
        imgContainer.classList.add('img-container');

        methods.forEach(method => {
          // Preload images
          lightDirections.forEach(dir => {
            const img = document.createElement('img');
            if (cropSubfolder) {
              img.src = `${folderName}/${method}/${crop}/${dir}.jpg`;
            } else {
              img.src = `${folderName}/${method}/${crop}_${dir}.jpg`;
            }
            // img.src = `${folderName}/${method}/${crop}_${dir}.jpg`;
            img.dataset.dir = dir;
            img.dataset.method = method;
            img.style.opacity = ((dir === initialDirection) && (method === initialMethod)) ? 1 : 0; // Show the first light direction
            img.style.opacity = 0;
            imgContainer.appendChild(img);
          });
        });
        // Append imgContainer to col
        col.appendChild(imgContainer);
        row.appendChild(col);

      });
      resultsContainer.appendChild(row);
      
      
      const updateTable = () => {
        if (azimuthValueText !== null)
            azimuthValueText.innerText = `${azimuthIndex * 45}°`;
        
        if (parameterValueText !== null && methodsMapping !== null)
            parameterValueText.innerText = `${methodsMapping[selectedMethod]}`;

        resultsContainer.querySelectorAll('.result-cell').forEach(cell => {
          cell.querySelectorAll('img').forEach(img => {
            img.style.opacity = ((img.dataset.dir === azimuth) && (img.dataset.method == selectedMethod)) ? 1 : 0;
          });
        });
      }
      let parameterValueIndex = 0;
      let selectedMethod = methods[parameterValueIndex];
      let azimuthIndex = 0;
      let azimuth = lightDirections[azimuthIndex];
      // add event listerner for the azimuth slider
      updateTable(selectedMethod, azimuth);

      if (azimuthSlider !== null) {
        azimuthSlider.addEventListener('input', e => {
            azimuthIndex = parseInt(e.target.value);
            azimuth = lightDirections[azimuthIndex];
            updateTable(selectedMethod, azimuth);
        });
      }
      if (parameterSlider !== null) {
        // add event listerner for the gamma slider
        parameterSlider.addEventListener('input', e => {
          parameterValueIndex = parseInt(e.target.value);
          selectedMethod = methods[parameterValueIndex];
          updateTable(selectedMethod, azimuth);
        });
      }
  }