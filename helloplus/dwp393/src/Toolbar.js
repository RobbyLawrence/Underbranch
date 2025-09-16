const Toolbar = ({ viewMode, onViewModeChange, latexCode }) => {
    const handleDownload = () => {
        const blob = new Blob([latexCode], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'document.tex';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleClear = () => {
        if (confirm('Are you sure you want to clear the editor?')) {
            onViewModeChange('editor');
            // This will be handled by the parent component
            const event = new CustomEvent('clearEditor');
            window.dispatchEvent(event);
        }
    };

    return React.createElement('div', { className: 'toolbar' },
        React.createElement('h1', null, 'LaTeX Editor'),
        React.createElement('div', { className: 'toolbar-buttons' },
            React.createElement('button', {
                className: `btn ${viewMode === 'editor' ? 'btn-primary' : 'btn-secondary'}`,
                onClick: () => onViewModeChange('editor')
            }, 'Editor'),
            React.createElement('button', {
                className: `btn ${viewMode === 'split' ? 'btn-primary' : 'btn-secondary'}`,
                onClick: () => onViewModeChange('split')
            }, 'Split'),
            React.createElement('button', {
                className: `btn ${viewMode === 'preview' ? 'btn-primary' : 'btn-secondary'}`,
                onClick: () => onViewModeChange('preview')
            }, 'Preview'),
            React.createElement('button', {
                className: 'btn btn-secondary',
                onClick: handleDownload
            }, 'Download'),
            React.createElement('button', {
                className: 'btn btn-secondary',
                onClick: handleClear
            }, 'Clear')
        )
    );
};

export default Toolbar;