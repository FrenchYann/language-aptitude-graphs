const root = d3.select('#root');

makeExportButtons(root.node(), config);
update(root, window.config);
make_gui(window.config, () => update(root, config));
