// Not really used, I planned to enable linking to graphs
// but now that you can have any number of graphs, the GET method
// wouldn't be enough, and huge links are just too ugly
// I keep it here though, 'cause it was fun to do
{
  // serialize a somewhat compressed config to use in GET method for embedding
  // retrieve this compressed config
  const compression_map = [
    ['background_color', 'bc'],
    ['line_color', 'lc'],
    ['line_width', 'lw'],
    ['opacity', 'o'],
    ['radius', 'r'],
    ['max_value', 'mv'],
    ['subdivisions', 'sd'],
    ['font_color', 'fc'],
    ['font_size', 'fs'],
    ['font_family', 'ff'],
    ['width', 'w'],
    ['height', 'h'],
    ['labels', 'l'],
    ['fill', 'f'],
    ['stroke', 's'],
    ['data', 'd']
  ];

  const [comp_map, decomp_map] = (map => {
    const comp_map = {};
    const decomp_map = {};
    for (let item of map) {
      let full_name = item[0];
      let comp_name = item[1];
      if (full_name in comp_map) {
        throw new Error(`Duplicate full name "${full_name}" -> "${comp_name}"`);
      }
      if (comp_name in decomp_map) {
        throw new Error(`Duplicate comp name "${comp_name}" -> "${full_name}"`);
      }
      comp_map[item[0]] = item[1];
      decomp_map[item[1]] = item[0];
    }
    return [comp_map, decomp_map];
  })(compression_map);

  const compress_data = data => {
    let res = {};
    for (let p in data) {
      if (p.charAt(0) === '_') continue;
      if (!(p in comp_map)) {
        throw new Error(`missing compression mapping field "${p}"`);
      }
      res[comp_map[p]] = data[p];
    }
    return res;
  };

  const decompress_data = data => {
    let res = {};
    for (let p in data) {
      if (!(p in decomp_map)) {
        throw new Error(`missing decompression mapping field "${p}"`);
      }
      res[decomp_map[p]] = data[p];
    }
    return res;
  };

  const uint8_to_b64 = data => btoa(String.fromCharCode.apply(null, data));
  const b64_to_uint8 = data =>
    new Uint8Array(
      atob(data)
        .split('')
        .map(function(c) {
          return c.charCodeAt(0);
        })
    );

  const generate_config = config => {
    let compressed = [compress_data(config.grid_settings)];
    for (let graph of config.graphs) {
      compressed.push(compress_data(graph));
    }
    uint8_to_b64(serializeMsgPack(compressed));
  };
  const retrieve_config = data => {
    let compressed = deserializeMsgPack(b64_to_uint8(data));
    const grid_settings = decompress_data(compressed[0]);
    const graphs = [];
    for (let i = 1; i < compressed.length; i++) {
      graphs.push(decompress_data(compressed[i]));
    }
    return {
      grid_settings,
      graphs
    };
  };
  window.generate_config = generate_config;
  window.retrieve_config = retrieve_config;
}
