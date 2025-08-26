require([
  "esri/Map",
  "esri/views/MapView",
  "esri/layers/GeoJSONLayer",
  "esri/widgets/LayerList",
  "esri/widgets/Legend",
  "esri/widgets/ScaleBar",
  "esri/widgets/BasemapGallery",
  "esri/Basemap",
  "esri/layers/WebTileLayer"
], function (
  Map, MapView, GeoJSONLayer,
  LayerList, Legend, ScaleBar, BasemapGallery, Basemap, WebTileLayer
) {

  // 📌 讀取圖層設定
  fetch("layers.json")
    .then(res => res.json())
    .then(layerConfigs => {

      // 建立底圖
      const basemap = new Basemap({
        baseLayers: [
          new WebTileLayer({
            urlTemplate: "https://tile.openstreetmap.org/{level}/{col}/{row}.png",
            title: "OpenStreetMap"
          })
        ],
        title: "OpenStreetMap"
      });

      const map = new Map({
        basemap: basemap
      });

      const view = new MapView({
        container: "viewDiv",
        map: map,
        center: [121, 24], // 臺灣大概中心
        zoom: 7
      });

      // 加入GeoJSON圖層
      layerConfigs.forEach(cfg => {
        const geoLayer = new GeoJSONLayer({
          url: cfg.url,
          title: cfg.title,
          outFields: ["*"],
          popupTemplate: {
            title: "{縣市} {鄉鎮}",
            content: [{
              type: "fields",
              fieldInfos: Object.keys(cfg.sampleAttributes).map(key => ({
                fieldName: key,
                label: key,
                visible: true
              }))
            }]
          },
          renderer: cfg.renderer
        });
        map.add(geoLayer);
      });

      // Widgets
      view.ui.add(new LayerList({ view: view }), "top-left");
      view.ui.add(new Legend({ view: view }), "top-right");
      view.ui.add(new ScaleBar({ view: view, unit: "metric" }), "bottom-left");

      const basemapGallery = new BasemapGallery({
        view: view,
        source: [
          new Basemap({
            baseLayers: [new WebTileLayer({ urlTemplate: "https://tile.openstreetmap.org/{level}/{col}/{row}.png" })],
            title: "OpenStreetMap"
          }),
          new Basemap({
            baseLayers: [new WebTileLayer({ urlTemplate: "https://wmts.nlsc.gov.tw/wmts/EMAP5/default/EPSG:3857/{level}/{row}/{col}" })],
            title: "台灣通用電子地圖",
			thumbnailUrl: "./image/nlscmapnotextthumnail.png"
          }),
          new Basemap({
            baseLayers: [new WebTileLayer({ urlTemplate: "https://mt1.google.com/vt/lyrs=r&x={col}&y={row}&z={level}" })],
            title: "Google地圖"
          }),
          new Basemap({
            baseLayers: [new WebTileLayer({ urlTemplate: "https://wmts.nlsc.gov.tw/wmts/PHOTO2/default/EPSG:3857/{level}/{row}/{col}" })],
            title: "正射影像"
          })
        ]
      });
      view.ui.add(basemapGallery, "bottom-right");
    });
});
