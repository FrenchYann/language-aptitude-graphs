{
  const query_string = parse_query_string(window.location.search);
  const default_labels = [
    'Comprehension',
    'Grammar',
    'Phrasing',
    'Pronunciation',
    'Delivery',
    'Content'
  ];
  let labels = default_labels;
  if (query_string.labels) {
    labels = query_string.labels.split(',');
  }

  //default config
  const default_config = {
    grid_settings: {
      background_color: '#ffffff',
      line_color: '#000000',
      line_width: 1,
      opacity: 1,
      radius: 100,
      max_value: 10,
      subdivisions: 5,
      width: 400,
      height: 310,
      font_color: '#000000',
      font_size: 17,
      font_family: 'Verdana',
      labels: labels
    }
  };

  const common_default_graph_settings = {
    opacity: 0.7,
    stroke: '#000000',
    line_width: 1.5
  };

  const default_graph_settings = [
    {
      ...common_default_graph_settings,
      fill: '#204f70',
      opacity: 0.9
    },
    {
      ...common_default_graph_settings,
      fill: '#592673'
    }
  ];
  window.create_graph = index => {
    let graph;
    if (index >= default_graph_settings.length) {
      graph = { ...common_default_graph_settings };
      graph.fill = random_color();
    } else {
      graph = {
        ...default_graph_settings[index]
      };
    }
    graph.data = new Array(default_config.grid_settings.labels.length)
      .fill()
      .map(() => random_int(1, default_config.grid_settings.max_value + 1));
    return graph;
  };

  default_config.graphs = [create_graph(0)];

  // if I implement some save/load with for example, localstorage
  // I can change the config here.

  window.config = default_config;
}
