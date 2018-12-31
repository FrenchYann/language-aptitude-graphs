const root = d3.select('#root');
if (!window.isEmbedded) {
  makeExportButtons(root.node(), config);
}
update(root, window.config);
if (!window.isEmbedded) {
  make_gui(window.config, () => update(root, config));
} else {
  document.body.style.overflow = 'hidden';
  document.body.style.margin = 0;
  document.body.style.padding = 0;
}
