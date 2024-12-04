#version 300 es

layout(location = 0) in vec3 a_position;
layout(location = 1) in vec3 a_normal;
layout(location = 2) in vec2 a_texCoord;

uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_projection;
uniform mat4 u_lightSpaceMatrix;

out vec3 v_normal;
out vec3 v_fragPos;
out vec2 v_texCoord;
out vec4 v_fragPosLightSpace;

void main() {
  v_normal = mat3(transpose(inverse(u_model))) * a_normal;
  vec4 fragPosWorld = u_model * vec4(a_position, 1.0);
  v_fragPos = fragPosWorld.xyz;
  v_texCoord = a_texCoord;
  v_fragPosLightSpace = u_lightSpaceMatrix * fragPosWorld;
  gl_Position = u_projection * u_view * fragPosWorld;
}
