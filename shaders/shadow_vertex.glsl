#version 300 es

layout(location = 0) in vec3 a_position;

uniform mat4 u_lightSpaceMatrix;
uniform mat4 u_model;

void main() {
  gl_Position = u_lightSpaceMatrix * u_model * vec4(a_position, 1.0);
}
