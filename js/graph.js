{
  const create_or_get = (root, id, type, on_create = null) => {
    let el = root.select(`#${id}`);
    if (el.empty()) {
      el = root.append(type).attr('id', id);
      if (on_create !== null) {
        on_create(el);
      }
    }
    return el;
  };

  const init = (graph, grid_settings) => {
    graph
      .attr('width', grid_settings.width)
      .attr('height', grid_settings.height);

    create_or_get(graph, 'background', 'rect')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('fill', grid_settings.background_color);
  };

  const update_centering = (graph, grid_settings) => {
    const x = grid_settings.width / 2;
    const y = grid_settings.height / 2;
    const centering_group = create_or_get(graph, 'centering-group', 'g');
    centering_group.attr('transform', `translate(${x},${y})`);
    return centering_group;
  };

  const make_grid = (root, grid_settings) => {
    function make_labels(root, grid_settings, data) {
      let sel = root.selectAll('text').data(data);
      sel
        .enter()
        .append('text')
        .merge(sel)
        .text(d => d.label.capitalize())
        .attr('x', d => d.position.x)
        .attr('y', d => d.position.y)
        .attr('text-anchor', d =>
          d.position.x < -0.1 ? 'end' : d.position.x > 0.1 ? 'start' : 'middle'
        )
        .attr('dominant-baseline', d =>
          d.position.y < -0.1
            ? 'ideographic'
            : d.position.y > 0.1
            ? 'hanging'
            : 'middle'
        )
        .attr('font-family', grid_settings.font_family)
        .attr('font-size', `${grid_settings.font_size}px`)
        .attr('fill', grid_settings.font_color);
      sel.exit().remove();
    }
    const make_shape = (root, grid_settings, data, group_name) => {
      let group = create_or_get(root, group_name, 'g');

      let sel = group.selectAll('path').data(data);
      sel
        .enter()
        .append('path')
        .merge(sel)
        .attr('opacity', d => ('opacity' in d ? d.opacity : 1))
        .attr('d', d => line(grid_settings)(d.data) + 'Z')
        .attr('stroke', d => d.stroke)
        .attr('stroke-width', d => d.line_width)
        .attr('fill', d => d.fill || 'transparent');
      sel.exit().remove();
    };

    const opacity_group = create_or_get(root, 'opacity-group', 'g', el => {
      el.append('g').attr('id', 'radial-group');
    });
    opacity_group.attr('opacity', grid_settings.opacity);

    let settings = [];
    for (let i = 1; i <= grid_settings.subdivisions; i++) {
      let radius = (grid_settings.max_value * i) / grid_settings.subdivisions;
      settings.push({
        data: Array(grid_settings.labels.length).fill(radius),
        stroke: grid_settings.line_color,
        line_width: grid_settings.line_width
      });
    }

    make_shape(opacity_group, grid_settings, settings, 'shape-group');

    let label_position = [];
    let radial_lines = [];
    for (let i = 0; i < grid_settings.labels.length; i++) {
      let angle = (i * Math.PI * 2) / grid_settings.labels.length - Math.PI / 2;
      let vec_x = Math.cos(angle);
      let vec_y = Math.sin(angle);
      radial_lines.push({
        x: vec_x * grid_settings.radius,
        y: vec_y * grid_settings.radius
      });
      const label_offset = 10; // TODO: in config...
      label_position.push({
        x: vec_x * (grid_settings.radius + label_offset),
        y: vec_y * (grid_settings.radius + label_offset)
      });
    }

    let sel = opacity_group
      .select('#radial-group')
      .selectAll('path')
      .data(radial_lines);
    sel
      .enter()
      .append('path')
      .merge(sel)
      .attr('d', p => `M 0 0 L ${p.x} ${p.y}`)
      .attr('stroke', grid_settings.line_color)
      .attr('stroke-width', grid_settings.line_width);

    make_labels(
      root,
      grid_settings,
      grid_settings.labels.map((l, i) => ({
        label: l,
        position: label_position[i]
      }))
    );
  };

  const line = grid_settings =>
    d3
      .radialLine()
      .radius(function(d) {
        return (d / grid_settings.max_value) * grid_settings.radius;
      })
      .angle(function(d, i, data) {
        return i * ((Math.PI * 2) / data.length);
      });

  window.update = function(root, config) {
    const { grid_settings, graphs } = config;
    const graph = create_or_get(root, 'graph', 'svg');

    init(graph, grid_settings);
    const group = update_centering(graph, grid_settings);
    const grid_group = create_or_get(group, 'grid', 'g');
    make_grid(grid_group, grid_settings, 'grid-group');

    const graphs_group = create_or_get(group, 'graphs', 'g');
    let sel = graphs_group.selectAll('g').data(graphs);
    sel.exit().remove();
    let allg = sel
      .enter()
      .append('g')
      .merge(sel)
      .attr('id', (_, i) => `graph${i}-group`);

    for (let [i, graph] of graphs.entries()) {
      let pathSel = d3
        .select(allg.nodes()[i])
        .selectAll('path')
        .data([graph]);
      pathSel.exit().remove();
      pathSel
        .enter()
        .append('path')
        .merge(pathSel)
        .attr('opacity', d => ('opacity' in d ? d.opacity : 1))
        .attr('d', d => line(grid_settings)(d.data) + 'Z')
        .attr('stroke', d => d.stroke)
        .attr('stroke-width', d => d.line_width)
        .attr('fill', d => d.fill || 'transparent');
    }
  };
}
