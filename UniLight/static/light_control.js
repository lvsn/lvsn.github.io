/**
 * Light Control Interactive Rotation
 * Handles environment map rotation visualization with dual-image display for all samples
 */

import { LIGHT_CONTROL_CONFIG, getImagePaths } from './light_control_config.js';

class LightController {
  constructor() {
    this.sampleControllers = new Map(); // Map of sample ID to controller state
    this.init();
  }

  init() {
    // Wait for DOM to be loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupElements());
    } else {
      this.setupElements();
    }
  }

  setupElements() {
    const container = document.getElementById('light-control-content');
    if (!container) {
      console.error('Light control container not found');
      return;
    }

    this.generateSampleRows(container);
  }

  generateSampleRows(container) {
    // Clear loading message
    container.innerHTML = '';

    // Generate a row for each sample
    LIGHT_CONTROL_CONFIG.forEach((sample, index) => {
      const sampleRow = this.createSampleRow(sample, index);
      container.appendChild(sampleRow);
      
      // Initialize controller state for this sample
      this.sampleControllers.set(sample.id, {
        rotation: 0,
        originalImage: sampleRow.querySelector(`.original-image-${sample.id}`),
        envmapImage: sampleRow.querySelector(`.envmap-image-${sample.id}`),
        relightingImage: sampleRow.querySelector(`.relighting-image-${sample.id}`),
        slider: sampleRow.querySelector(`.slider-${sample.id}`),
        rotationValue: sampleRow.querySelector(`.rotation-value-${sample.id}`)
      });

      // Setup event listeners for this sample
      this.setupSampleEventListeners(sample.id);
      
      // Initialize display
      this.updateSampleDisplay(sample.id, 0);
    });
  }

  createSampleRow(sample, index) {
    const sampleRow = document.createElement('div');
    sampleRow.className = 'sample-row';
    sampleRow.id = `sample-row-${sample.id}`;

    // Get display name
    const displayName = this.getDisplayName(sample);
    
    // Get initial image paths
    const initialPaths = getImagePaths(sample.id, 0);

    sampleRow.innerHTML = `
      <div class="sample-title">${displayName}</div>
      <div class="sample-subtitle">Scene: ${sample.scene_id}</div>
      
      <div class="dual-display">
        <div class="image-panel">
          <div class="panel-title original">Original Scene</div>
          <img class="rotation-image original original-image-${sample.id}" 
               src="${initialPaths && initialPaths.original ? initialPaths.original : ''}" 
               alt="Original scene for ${sample.scene_id}">
        </div>
        
        <div class="image-panel">
          <div class="panel-title envmap">Environment Map</div>
          <img class="rotation-image envmap envmap-image-${sample.id}" 
               src="${initialPaths ? initialPaths.control : ''}" 
               alt="Environment map for ${sample.scene_id}">
        </div>
        
        <div class="image-panel">
          <div class="panel-title relighting">Relighting Result</div>
          <img class="rotation-image relighting relighting-image-${sample.id}" 
               src="${initialPaths ? initialPaths.generated : ''}" 
               alt="Relighting result for ${sample.scene_id}">
        </div>
      </div>
      
      <div class="rotation-controls">
        <div class="slider-container">
          <label class="slider-label" for="slider-${sample.id}">
            Environment Map Rotation
          </label>
          <input type="range" 
                 id="slider-${sample.id}"
                 class="rotation-slider slider-${sample.id}"
                 min="-180" 
                 max="180" 
                 value="0" 
                 step="10">
          <div class="slider-values">
            <span>-180°</span>
            <span>0° (Original)</span>
            <span>+180°</span>
          </div>
        </div>
        
        <div class="current-rotation">
          Current Rotation: <span class="rotation-value-${sample.id}">0°</span>
        </div>
      </div>
    `;

    return sampleRow;
  }

  getDisplayName(sample) {
    const sceneType = sample.scene_id.includes('ulaval_outdoor') ? 'Outdoor Scene' :
                     sample.scene_id.includes('madacode') ? 'Indoor Scene' : 'Scene';
    return `${sample.name} - ${sceneType}`;
  }

  setupSampleEventListeners(sampleId) {
    const controller = this.sampleControllers.get(sampleId);
    if (!controller) return;

    // Slider event listener
    controller.slider.addEventListener('input', (e) => {
      const sliderValue = parseInt(e.target.value);
      controller.rotation = sliderValue;
      this.updateSampleDisplay(sampleId, sliderValue);
    });

    // Image load handlers (no opacity changes)
    controller.originalImage.addEventListener('load', () => {
      // Image loaded successfully
    });

    controller.envmapImage.addEventListener('load', () => {
      // Image loaded successfully
    });

    controller.relightingImage.addEventListener('load', () => {
      // Image loaded successfully
    });

    // Error handlers
    controller.originalImage.addEventListener('error', (e) => {
      console.warn(`Failed to load original image for ${sampleId}:`, e.target.src);
      this.handleImageError(sampleId, 'original');
    });
    controller.envmapImage.addEventListener('error', (e) => {
      console.warn(`Failed to load environment map image for ${sampleId}:`, e.target.src);
      this.handleImageError(sampleId, 'envmap');
    });

    controller.relightingImage.addEventListener('error', (e) => {
      console.warn(`Failed to load relighting image for ${sampleId}:`, e.target.src);
      this.handleImageError(sampleId, 'relighting');
    });
  }

  handleImageError(sampleId, imageType) {
    const controller = this.sampleControllers.get(sampleId);
    if (!controller) return;

    // Try fallback to 0 degree image or original
    const fallbackPaths = getImagePaths(sampleId, 0);
    if (fallbackPaths) {
      let imageElement, fallbackSrc;
      
      if (imageType === 'original') {
        imageElement = controller.originalImage;
        fallbackSrc = fallbackPaths.original || fallbackPaths.control;
      } else if (imageType === 'envmap') {
        imageElement = controller.envmapImage;
        fallbackSrc = fallbackPaths.control;
      } else if (imageType === 'relighting') {
        imageElement = controller.relightingImage;
        fallbackSrc = fallbackPaths.generated;
      }
      
      if (imageElement && fallbackSrc && !imageElement.src.includes('original') && !imageElement.src.includes('rot0deg')) {
        imageElement.src = fallbackSrc;
      }
    }
  }

  updateSampleDisplay(sampleId, sliderValue) {
    const controller = this.sampleControllers.get(sampleId);
    if (!controller) return;

    const imagePaths = getImagePaths(sampleId, sliderValue);
    
    if (!imagePaths) {
      console.error(`No image paths found for sample ${sampleId} at rotation ${sliderValue}`);
      return;
    }
    
    // Update image sources directly without fade effects
    controller.envmapImage.src = imagePaths.control;
    controller.relightingImage.src = imagePaths.generated;
    
    // Update rotation value display
    controller.rotationValue.textContent = `${sliderValue}°`;
    
    // Update slider value (in case it was programmatically set)
    controller.slider.value = sliderValue;
    
    console.log(`Sample ${sampleId}: Slider ${sliderValue}° -> Rotation ${imagePaths.rotation}°`);
  }

  /**
   * Set rotation for a specific sample
   */
  setSampleRotation(sampleId, sliderValue) {
    const controller = this.sampleControllers.get(sampleId);
    if (controller) {
      controller.rotation = sliderValue;
      this.updateSampleDisplay(sampleId, sliderValue);
    }
  }

  /**
   * Set rotation for all samples
   */
  setAllRotations(sliderValue) {
    this.sampleControllers.forEach((controller, sampleId) => {
      this.setSampleRotation(sampleId, sliderValue);
    });
  }

  /**
   * Get current state of all samples
   */
  getState() {
    const state = {};
    this.sampleControllers.forEach((controller, sampleId) => {
      state[sampleId] = controller.rotation;
    });
    return state;
  }
}

// Initialize the light controller when the script loads
const lightController = new LightController();

// Export for potential external use
window.LightController = LightController;
window.lightController = lightController;