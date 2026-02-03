/**
 * Retrieval Results Visualization Module
 * Renders interactive cross-modal retrieval results
 */

import { RETRIEVAL_CONFIG } from './retrieval_config.js';

class RetrievalViewer {
    constructor(containerId) {
        console.log('RetrievalViewer: Initializing...');
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`RetrievalViewer: Container #${containerId} not found`);
            return;
        }
        this.config = RETRIEVAL_CONFIG;
        console.log('RetrievalViewer: Config loaded with', this.config.modalities.length, 'modalities');
        this.currentSourceModality = this.config.modalities[0];
        this.currentTargetModality = this.getFirstAvailableTarget(this.currentSourceModality);
        this.init();
    }

    getFirstAvailableTarget(sourceModality) {
        if (this.config.pairs[sourceModality]) {
            return Object.keys(this.config.pairs[sourceModality])[0] || this.config.modalities[1];
        }
        return this.config.modalities[1];
    }

    init() {
        this.render();
        this.setupEventListeners();
        console.log('RetrievalViewer: Initialization complete');
    }

    render() {
        this.container.innerHTML = `
            <div class="retrieval-controls">
                <div class="modality-selectors">
                    <div class="selector-group">
                        <label for="source-selector">Source Modality:</label>
                        <select id="source-selector" class="modality-select">
                            ${this.config.modalities.map(mod => `
                                <option value="${mod}" ${mod === this.currentSourceModality ? 'selected' : ''}>
                                    ${this.config.modalityLabels[mod] || mod}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="arrow-separator">→</div>
                    <div class="selector-group">
                        <label for="target-selector">Target Modality:</label>
                        <select id="target-selector" class="modality-select">
                            ${this.getAvailableTargets(this.currentSourceModality).map(mod => `
                                <option value="${mod}" ${mod === this.currentTargetModality ? 'selected' : ''}>
                                    ${this.config.modalityLabels[mod] || mod}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                </div>
            </div>
            <div class="retrieval-content">
                ${this.renderPairContent()}
            </div>
        `;
    }

    getAvailableTargets(sourceModality) {
        if (this.config.pairs[sourceModality]) {
            return Object.keys(this.config.pairs[sourceModality]);
        }
        return [];
    }

    renderPairContent() {
        const pairData = this.config.pairs[this.currentSourceModality]?.[this.currentTargetModality];
        if (!pairData) {
            return `<div class="no-data">No data available for ${this.currentSourceModality} → ${this.currentTargetModality}</div>`;
        }

        const sourceLabel = this.config.modalityLabels[this.currentSourceModality] || this.currentSourceModality;
        const targetLabel = this.config.modalityLabels[this.currentTargetModality] || this.currentTargetModality;
        
        return `
            <div class="retrieval-pair-header">
                <span class="modality-badge source">${sourceLabel}</span>
                <span class="arrow">→</span>
                <span class="modality-badge target">${targetLabel}</span>
            </div>
            <div class="retrieval-examples">
                ${pairData.examples.map((example, idx) => this.renderExample(example, idx, pairData)).join('')}
            </div>
        `;
    }

    renderExample(example, index, pair) {
        const isSourceText = pair.sourceModality === 'light_description_summary';
        const isTargetText = pair.targetModality === 'light_description_summary';
        
        return `
            <div class="retrieval-example">
                <div class="retrieval-row best-row">
                    <div class="retrieval-query">
                        <div class="query-label">Query</div>
                        ${isSourceText ? 
                            `<div class="text-content query-text">${example.source.description || 'N/A'}</div>` :
                            `<img src="${example.source.imagePath}" alt="Query" class="query-img" loading="lazy" />`
                        }
                        <div class="item-info">${example.source.scene} / ${example.source.image}</div>
                    </div>
                    <div class="retrieval-results">
                        <div class="results-label best-results-label">Best Matches (Top-3)</div>
                        <div class="results-grid">
                            ${example.results.map(result => this.renderResult(result, isTargetText, 'best')).join('')}
                        </div>
                    </div>
                </div>
                ${example.worstResults && example.worstResults.length > 0 ? `
                <div class="retrieval-row worst-row">
                    <div class="retrieval-query-placeholder"></div>
                    <div class="retrieval-results worst-results-section">
                        <div class="results-label worst-results-label">Worst Matches (Bottom-3)</div>
                        <div class="results-grid">
                            ${example.worstResults.map(result => this.renderResult(result, isTargetText, 'worst')).join('')}
                        </div>
                    </div>
                </div>
                ` : ''}
            </div>
        `;
    }

    renderResult(result, isText, type = 'best') {
        const isWorst = type === 'worst';
        const rankClass = isWorst ? `rank-worst-${result.rank}` : 
                          result.rank === 1 ? 'rank-1' : result.rank === 2 ? 'rank-2' : 'rank-3';
        const rankLabel = isWorst ? `Bot ${result.rank}` : `Top ${result.rank}`;
        
        return `
            <div class="result-item ${isWorst ? 'worst-result' : ''}">
                <span class="rank ${rankClass}">${rankLabel}</span>
                ${isText ?
                    `<div class="text-content">${result.description || 'N/A'}</div>` :
                    `<img src="${result.imagePath}" alt="Result ${result.rank}" loading="lazy" />`
                }
                <div class="sim-score">Similarity: ${result.similarity.toFixed(3)}</div>
                <div class="item-info">${result.scene} / ${result.image}</div>
            </div>
        `;
    }

    setupEventListeners() {
        // Source modality selector
        const sourceSelector = this.container.querySelector('#source-selector');
        sourceSelector.addEventListener('change', (e) => {
            this.currentSourceModality = e.target.value;
            this.currentTargetModality = this.getFirstAvailableTarget(this.currentSourceModality);
            this.updateTargetSelector();
            this.updateContent();
        });

        // Target modality selector
        const targetSelector = this.container.querySelector('#target-selector');
        targetSelector.addEventListener('change', (e) => {
            this.currentTargetModality = e.target.value;
            this.updateContent();
        });

        // Image modal
        this.container.addEventListener('click', (e) => {
            if (e.target.tagName === 'IMG') {
                this.showModal(e.target.src);
            }
        });
    }

    updateTargetSelector() {
        const targetSelector = this.container.querySelector('#target-selector');
        const availableTargets = this.getAvailableTargets(this.currentSourceModality);
        
        targetSelector.innerHTML = availableTargets.map(mod => `
            <option value="${mod}" ${mod === this.currentTargetModality ? 'selected' : ''}>
                ${this.config.modalityLabels[mod] || mod}
            </option>
        `).join('');
    }

    updateContent() {
        const content = this.container.querySelector('.retrieval-content');
        content.innerHTML = this.renderPairContent();
    }

    showModal(src) {
        // Create modal if not exists
        let modal = document.getElementById('retrieval-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'retrieval-modal';
            modal.className = 'retrieval-modal';
            modal.innerHTML = `
                <span class="modal-close">&times;</span>
                <div class="modal-content">
                    <img src="" alt="Full size" />
                </div>
            `;
            document.body.appendChild(modal);
            
            modal.querySelector('.modal-close').addEventListener('click', () => {
                modal.style.display = 'none';
            });
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        }
        
        modal.querySelector('img').src = src;
        modal.style.display = 'block';
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new RetrievalViewer('retrieval-viewer-container');
});

export { RetrievalViewer };
