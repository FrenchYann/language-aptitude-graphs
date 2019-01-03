let data_controllers = [];

function make_gui(config, update) {
  const update_max_value = v => {
    for (let ctr of data_controllers) {
      ctr.__max = v;
      ctr.updateDisplay();
    }
  }
  const gui_data = (gui, grid_settings, graph_settings) => {
    for (let [i, p] of grid_settings.labels.entries()) {
      graph_settings._temps = graph_settings._temps || {};
      graph_settings._temps[p] = graph_settings.data[i];

      data_controllers.push(
        gui.add(graph_settings._temps, p).min(0).max(grid_settings.max_value)
          .onChange(v => {
            graph_settings.data[i] = v;
            update();
          })
      );
    }
  }

  const make_graph_gui = (gui, name, grid_settings, graph_settings, remover, open=true) => {
    let graph_folder = gui.addFolder(name);
    graph_style = graph_folder.addFolder('Look');
    graph_style.addColor(graph_settings, 'fill').onChange(update);
    graph_style.add(graph_settings, 'opacity').min(0).max(1).onChange(update);
    graph_style.addColor(graph_settings, 'stroke').onChange(update);
    graph_style.add(graph_settings, 'line_width').min(0).max(10).step(0.25).onChange(update);
  
    graph_data = graph_folder.addFolder('Data');
    gui_data(graph_data, grid_settings, graph_settings);
    if (open) {
      graph_folder.open();
      graph_data.open();
    }
    let delete_graph = {['Remove Graph']:()=>{
        gui.removeFolder(graph_folder);
        remover();
      }
    }
    graph_folder.add(delete_graph,'Remove Graph');
  }

  const { grid_settings, graphs} = config;
  const gui = new dat.GUI();
  grid = gui.addFolder('Grid');
  grid.addColor(grid_settings, 'background_color').onChange(update);
  grid.addColor(grid_settings, 'line_color').onChange(update);
  grid.add(grid_settings, 'line_width').min(0).max(10).step(0.25).onChange(update);
  grid.add(grid_settings, 'opacity').min(0).max(1).onChange(update);
  grid.add(grid_settings, 'radius').min(50).max(200).onChange(update);
  grid.add(grid_settings, 'max_value').min(1)
    .onChange(v => {
      update_max_value(v);
      update();
    });
  grid.add(grid_settings, 'subdivisions').min(0).max(10).step(1).onChange(update);
  grid.add(grid_settings, 'width').min(100).max(800).step(1).onChange(update);
  grid.add(grid_settings, 'height').min(100).max(800).step(1).onChange(update);
  grid.addColor(grid_settings, 'font_color').onChange(update);
  grid.add(grid_settings, 'font_size').min(4).max(100).step(1).onChange(update);
  grid.add(grid_settings, 'font_family').onChange(update);

  
  const remover = (graph) => () => {
    let index = graphs.indexOf(graph);
    graphs.splice(index,1);
    for (let i = index; i < graphs.length; i++) {
      let old_name = `Graph${i+2}`;
      let new_name = `Graph${i+1}`;
      let folder = gui.__folders[old_name];
      folder.name = new_name;
      delete gui.__folders[old_name];
      gui.__folders[new_name] = folder;
      folder.updateDisplay();
    }
    update();
  }

  for (let [index, graph] of graphs.entries()) {
    make_graph_gui(gui, `Graph${index+1}`, grid_settings, graph, remover(graph));
  }

  let add_graph_button;
  let add_graph = {["Add Graph"]: ()=>{
    let new_graph = create_graph(grid_settings.labels.length, grid_settings.max_value);
    let index = graphs.push(new_graph);
    make_graph_gui(gui, `Graph${index}`, grid_settings, new_graph, remover(new_graph));
    gui.remove(add_graph_button);
    add_graph_button = gui.add(add_graph, "Add Graph");
    update();
  }};
  add_graph_button = gui.add(add_graph, "Add Graph");

}

function svgToImage(svg, png = true) {
  let canvas = document.createElement('canvas');
  canvas.width = svg.getAttribute('width');
  canvas.height = svg.getAttribute('height');
  let ctx = canvas.getContext('2d');

  var svg_uri = new XMLSerializer().serializeToString(svg);
  var svg_img_uri = 'data:image/svg+xml; charset=utf8, ' + encodeURIComponent(svg_uri);

  if (png) {
    var img = new Image();
    img.src = svg_img_uri;
    img.onload = function() {
      ctx.drawImage(this, 0, 0);
      download(ctx.canvas.toDataURL(), 'graph.png');
    };
  } else {
    download(svg_img_uri, 'graph.svg');
  }
}

function download(url, filename) {
  var a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function makeExportButtons($root, config) {
  const $to_png = document.createElement('button');
  $to_png.textContent = 'Download As PNG';
  $to_png.onclick = function() {
    svgToImage($root.querySelector('svg'));
  };
  const $to_svg = document.createElement('button');
  $to_svg.textContent = 'Download As SVG';
  $to_svg.onclick = function() {
    svgToImage($root.querySelector('svg'), false);
  };
  
  const $to_embed = document.createElement('button');
  $to_embed.textContent = 'Embed SVG';
  $to_embed.onclick = function() {
    let $popup_container = document.createElement('div');
    let $fragment = document.getElementById("embed-popup-template").content.cloneNode(true);
    let $output = $fragment.querySelector("textarea");
    let svg = new XMLSerializer().serializeToString($root.querySelector('svg'));
    $output.textContent = svg;
    
    let $close_btn = $fragment.querySelector("button");
    $close_btn.onclick = () => document.body.removeChild($popup_container);
    $popup_container.appendChild($fragment);
    document.body.appendChild($popup_container);
  };

  const $container = document.createElement('div');
  $container.appendChild($to_png);
  $container.appendChild($to_svg);
  $container.appendChild($to_embed);
  $root.appendChild($container);

}