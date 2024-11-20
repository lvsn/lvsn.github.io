
const nameMapping = {
'shadow_comp_v2_default_post_color_balanced_denoised': "Ours (ZeroComp)",
'rgbx_cfg_3_intensity_2_inpaint_post_color_balanced_denoised': 'Ours (RGB-X)',
'ic_light_bg_guidance_denoised': 'IC Light [73]',
'dilightnet_denoised': 'DiLightNet [71]',
'neural_gaffer_denoised': 'Neural Gaffer [30]',
'stick-renders': 'Light direction',
'simulated_gt': 'Simulated GT',
}
const defaultLightDirections = ['0000', '0001', '0002', '0003', '0004', '0005', '0006', '0007'];



const cropNamesFig5ext = ["9C4A8088-1bb62eeb83_07_crop_B07B4MRLNC", "AG8A6719-fc8e1ea686_05_crop_B072Y5MZQH", "9C4A0400-e71f3506f8_00_crop_B07QC8CGKK", "9C4A0395-ef28332472_09_crop_B07YPLQ7KW", "AG8A1932-eb0d101d0e_07_crop_B00BBDF500", "9C4A3419-2e5c9b4d85_00_crop_B07B4MG2MD", "9C4A4668-16193e7517_03_crop_B072FVHS4V", "AG8A4106-248c9b6695_01_crop_B07G2WWZC5", "9C4A6765-55315335bf_09_crop_B076YFLYFR", "9C4A0400-e71f3506f8_00_crop_B07B4CZMNQ", "9C4A0566-a088c98ccf_00_crop_B07HZ6ZCW7", "9C4A0132-07352d1dd0_08_crop_B07PHP31FB", "9C4A9487-24b5ce36e4_01_crop_B07B4MDGDF", "AG8A4106-248c9b6695_00_crop_B07HZ1LZS1", "AG8A8563-e652dd5751_02_crop_B07QHYDDS1", "9C4A0132-07352d1dd0_07_crop_B07DBF3WMC", "9C4A6864-533a74ab58_04_crop_B076VF4KRN", "9C4A5673-d4ecde512a_00_crop_B07HPTBB7P", "AG8A8710-4a14a72a31_05_crop_B07B4LZQC9", "9C4A0400-e71f3506f8_00_crop_B082QBBY7R"]; // Example crop names
const methodsFig5ext = [
'ic_light_bg_guidance_denoised',
'dilightnet_denoised',
'neural_gaffer_denoised',
'rgbx_cfg_3_intensity_2_inpaint_post_color_balanced_denoised', 
'shadow_comp_v2_default_post_color_balanced_denoised'
]
const resultsContainerFig5ext = document.getElementById('results-container-fig-5-ext');

cropNamesFig5ext.forEach(crop => {
    const row = document.createElement('div');
    row.classList.add('row', 'mb-3');

    row.dataset.crop = crop;

    methodsFig5ext.forEach(method => {
        const col = document.createElement('div');
        col.classList.add('col-md', 'result-cell');
        col.dataset.method = method;
        col.dataset.crop = crop;

        // Create imgContainer
        const imgContainer = document.createElement('div');
        imgContainer.classList.add('img-container');

        // Preload images
        defaultLightDirections.forEach(dir => {
            const img = document.createElement('img');
            img.src = `figures/qual_many_directions_html/${method}/${crop}_${dir}.jpg`;
            img.dataset.dir = dir;
            img.style.opacity = dir === '0000' ? 1 : 0; // Show the first light direction
            imgContainer.appendChild(img);
        });

        // Append imgContainer to col
        col.appendChild(imgContainer);

        // Create label
        const label = document.createElement('div');
        label.classList.add('method-label');
        label.innerText = nameMapping[method] || method;

        // Append label to col
        col.appendChild(label);

        row.appendChild(col);
        
        // Add mousemove listener to the entire row
        col.addEventListener('mousemove', e => {
            const rect = col.getBoundingClientRect();
            const relX = e.clientX - rect.left; // Relative X position within the row
            const index = Math.floor(Math.max((relX / rect.width) * defaultLightDirections.length, 0));
            const selectedDir = defaultLightDirections[Math.min(index, defaultLightDirections.length - 1)];

            resultsContainerFig5ext.querySelectorAll('.result-cell').forEach(cell => {
                cell.querySelectorAll('img').forEach(img => {
                img.style.opacity = img.dataset.dir === selectedDir ? 1 : 0;
                });
            });
        });

    });

    resultsContainerFig5ext.appendChild(row);
});