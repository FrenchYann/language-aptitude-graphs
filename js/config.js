{
  const query_string = parse_query_string(window.location.search);
  const default_labels = [
    'pronounciation',
    'delivery',
    'content',
    'comprehension',
    'phrasing',
    'grammar'
  ];
  let labels = default_labels;
  if (query_string.labels) {
    labels = query_string.labels.split(',');
  }

  //default config
  const default_config = {
    grid_settings: {
      background_color: '#002d55',
      line_color: '#008dff',
      line_width: 2,
      opacity: 0.3,
      radius: 100,
      max_value: 10,
      subdivisions: 5,
      font_color: '#008dff',
      font_size: 20,
      font_family: 'Verdana',
      width: 600,
      height: 400,
      labels: labels
    }
  };
  default_config.graphs = [
    create_graph(
      default_config.grid_settings.labels.length,
      default_config.grid_settings.max_value
    )
  ];
  let config = default_config;

  let isEmbedded = !!query_string.embed && query_string.config;
  if (query_string.config) {
    try {
      config = retrieve_config(query_string.config);
    } catch (e) {
      window.alert('invalid config');
      console.error(e);
      isEmbedded = false;
    }
  }

  for (let graph of config.graphs) {
    graph.data = enforce_array_length(
      graph.data,
      config.grid_settings.labels.length,
      5
    );
  }

  window.config = config;
  window.isEmbedded = isEmbedded;
}
