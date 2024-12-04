'use strict';

export class OBJLoader {
  constructor() {
    // Initialization code if needed
  }

  load(url, onLoad, onProgress, onError) {
    fetch(url)
      .then(response => response.text())
      .then(data => {
        let objectData = this.parse(data);
        onLoad(objectData);
      })
      .catch(error => {
        if (onError) onError(error);
      });
  }

  parse(data) {
    let vertices = [];
    let normals = [];
    let uvs = [];
    let indices = [];

    let lines = data.split('\n');
    let positions = [];
    let texCoords = [];
    let normalVectors = [];
    let faceIndices = [];

    lines.forEach(line => {
      line = line.trim();
      if (line.startsWith('v ')) {
        let [, x, y, z] = line.split(/\s+/);
        positions.push(parseFloat(x), parseFloat(y), parseFloat(z));
      } else if (line.startsWith('vt ')) {
        let [, u, v] = line.split(/\s+/);
        texCoords.push(parseFloat(u), parseFloat(v));
      } else if (line.startsWith('vn ')) {
        let [, x, y, z] = line.split(/\s+/);
        normalVectors.push(parseFloat(x), parseFloat(y), parseFloat(z));
      } else if (line.startsWith('f ')) {
        let [, ...face] = line.split(/\s+/);
        face.forEach(faceVertex => {
          let [posIdx, texIdx, normIdx] = faceVertex.split('/').map(idx => parseInt(idx) - 1);
          vertices.push(positions[posIdx * 3], positions[posIdx * 3 + 1], positions[posIdx * 3 + 2]);
          if (texIdx !== undefined && texIdx >= 0) {
            uvs.push(texCoords[texIdx * 2], texCoords[texIdx * 2 + 1]);
          }
          if (normIdx !== undefined && normIdx >= 0) {
            normals.push(normalVectors[normIdx * 3], normalVectors[normIdx * 3 + 1], normalVectors[normIdx * 3 + 2]);
          }
          indices.push(indices.length);
        });
      }
    });

    return {
      vertices: vertices,
      normals: normals,
      uvs: uvs,
      indices: indices
    };
  }
}
