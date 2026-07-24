"""Build and render Product Templates 184-193 with real Blender animation.

Run one design:
  Blender --background --factory-startup --python scripts/build-render-advanced-studio2-template18.py -- marble-split-gate

Run all designs:
  Blender --background --factory-startup --python scripts/build-render-advanced-studio2-template18.py -- all
"""

from __future__ import annotations

import json
import math
import sys
from pathlib import Path

import bpy
from bpy_extras.object_utils import world_to_camera_view
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[1]
POLY = Path("/Users/austin/Downloads/Poly Haven")
OUTPUT = ROOT / "public/advanced-studio2-assets/blender/template18"
FRAMES = 300
FPS = 30

DESIGNS = {
    "marble-split-gate": ("marble_01", "studio_small_09"),
    "basalt-pedestal-rise": ("dark_rock_02", "studio_small_08"),
    "slate-mechanical-iris": ("slate_floor_03", "studio_small_03"),
    "granite-tracking-corridor": ("granite_tile_04", "studio_small_05"),
    "sandstone-sundial": ("sandstone_cracks", "studio_small_05"),
    "blue-steel-compression-bay": ("blue_metal_plate", "studio_small_08"),
    "terrazzo-rotating-atrium": ("terrazzo_tiles", "studio_small_09"),
    "velvet-proscenium": ("velour_velvet", "studio_small_05"),
    "concrete-monolith-cascade": ("concrete", "studio_small_03"),
    "brass-halo-chamber": ("metal_plate", "studio_small_08"),
}


def key(obj, frame, path, value, interpolation="BEZIER"):
    setattr(obj, path, value)
    obj.keyframe_insert(data_path=path, frame=frame)
    action = obj.animation_data.action if obj.animation_data else None
    if action:
        for curve in action.fcurves:
            for point in curve.keyframe_points:
                point.interpolation = interpolation


def key_vec(obj, frame, path, value):
    setattr(obj, path, value)
    obj.keyframe_insert(data_path=path, frame=frame)


def collection(name):
    item = bpy.data.collections.new(name)
    bpy.context.scene.collection.children.link(item)
    return item


def move_to(obj, target):
    for current in list(obj.users_collection):
        current.objects.unlink(obj)
    target.objects.link(obj)
    return obj


def texture(asset, token):
    matches = sorted((POLY / asset).glob(f"**/*{token}*1k*"))
    if not matches:
        raise RuntimeError(f"Missing required {token} PBR map for {asset}")
    return matches[0]


def image_node(nodes, path, colorspace):
    node = nodes.new("ShaderNodeTexImage")
    node.image = bpy.data.images.load(str(path), check_existing=True)
    node.image.colorspace_settings.name = colorspace
    return node


def pbr(asset, tint=None):
    material = bpy.data.materials.new(f"PolyHaven_{asset}")
    material.use_nodes = True
    nodes = material.node_tree.nodes
    links = material.node_tree.links
    nodes.clear()
    output = nodes.new("ShaderNodeOutputMaterial")
    shader = nodes.new("ShaderNodeBsdfPrincipled")
    links.new(shader.outputs["BSDF"], output.inputs["Surface"])
    coordinates = nodes.new("ShaderNodeTexCoord")
    mapping = nodes.new("ShaderNodeMapping")
    mapping.inputs["Scale"].default_value = (2.4, 2.4, 2.4)
    links.new(coordinates.outputs["Generated"], mapping.inputs["Vector"])
    diffuse = image_node(nodes, texture(asset, "_diff_"), "sRGB")
    links.new(mapping.outputs["Vector"], diffuse.inputs["Vector"])
    if tint:
        mix = nodes.new("ShaderNodeMixRGB")
        mix.blend_type = "MULTIPLY"
        mix.inputs[0].default_value = 0.72
        mix.inputs[2].default_value = (*tint, 1)
        links.new(diffuse.outputs["Color"], mix.inputs[1])
        links.new(mix.outputs["Color"], shader.inputs["Base Color"])
    else:
        links.new(diffuse.outputs["Color"], shader.inputs["Base Color"])
    rough = image_node(nodes, texture(asset, "_rough_"), "Non-Color")
    normal_image = image_node(nodes, texture(asset, "_nor_gl_"), "Non-Color")
    links.new(mapping.outputs["Vector"], rough.inputs["Vector"])
    links.new(mapping.outputs["Vector"], normal_image.inputs["Vector"])
    normal = nodes.new("ShaderNodeNormalMap")
    normal.inputs["Strength"].default_value = 0.65
    links.new(rough.outputs["Color"], shader.inputs["Roughness"])
    links.new(normal_image.outputs["Color"], normal.inputs["Color"])
    links.new(normal.outputs["Normal"], shader.inputs["Normal"])
    metal = sorted((POLY / asset).glob("**/*_metal_*1k*"))
    if metal:
        metal_image = image_node(nodes, metal[0], "Non-Color")
        links.new(mapping.outputs["Vector"], metal_image.inputs["Vector"])
        links.new(metal_image.outputs["Color"], shader.inputs["Metallic"])
    elif asset == "metal_plate":
        raise RuntimeError("Brass Halo Chamber requires the Poly Haven metallic map")
    return material


def emissive(name, color, strength=8):
    material = bpy.data.materials.new(name)
    material.use_nodes = True
    shader = material.node_tree.nodes.get("Principled BSDF")
    shader.inputs["Base Color"].default_value = (*color, 1)
    shader.inputs["Emission Color"].default_value = (*color, 1)
    shader.inputs["Emission Strength"].default_value = strength
    return material


def cube(name, loc, scale, mat, target, bevel=0.08):
    bpy.ops.mesh.primitive_cube_add(location=loc)
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel:
        modifier = obj.modifiers.new("Architectural bevel", "BEVEL")
        modifier.width = bevel
        modifier.segments = 3
    obj.data.materials.append(mat)
    return move_to(obj, target)


def cylinder(name, loc, radius, depth, mat, target, vertices=96):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=depth, location=loc)
    obj = bpy.context.object
    obj.name = name
    obj.data.materials.append(mat)
    bevel = obj.modifiers.new("Edge bevel", "BEVEL")
    bevel.width = 0.07
    bevel.segments = 3
    return move_to(obj, target)


def torus(name, loc, major, minor, mat, target, rotation=(math.pi / 2, 0, 0)):
    bpy.ops.mesh.primitive_torus_add(
        major_radius=major, minor_radius=minor, major_segments=128, minor_segments=24,
        location=loc, rotation=rotation,
    )
    obj = bpy.context.object
    obj.name = name
    obj.data.materials.append(mat)
    return move_to(obj, target)


def aim(camera, target=(0, 0.5, 2.8)):
    camera.rotation_euler = (Vector(target) - camera.location).to_track_quat("-Z", "Y").to_euler()


def animate_camera(camera, points):
    for frame, location, target in points:
        camera.location = location
        aim(camera, target)
        camera.keyframe_insert("location", frame=frame)
        camera.keyframe_insert("rotation_euler", frame=frame)


def base_scene(asset, hdri, brass=False):
    scene = bpy.context.scene
    scene.frame_start = 0
    scene.frame_end = 299
    scene.render.fps = FPS
    scene.render.engine = "BLENDER_EEVEE_NEXT"
    scene.eevee.taa_render_samples = 8
    scene.render.resolution_x = 1920
    scene.render.resolution_y = 1920
    scene.render.resolution_percentage = 100
    scene.render.image_settings.color_depth = "8"
    scene.render.film_transparent = False
    scene.render.use_file_extension = True
    scene.view_settings.look = "AgX - Medium High Contrast"
    scene.render.image_settings.color_mode = "RGBA"

    world = bpy.data.worlds.new("Poly Haven World")
    world.use_nodes = True
    scene.world = world
    nodes = world.node_tree.nodes
    links = world.node_tree.links
    nodes.clear()
    output = nodes.new("ShaderNodeOutputWorld")
    bg = nodes.new("ShaderNodeBackground")
    env = nodes.new("ShaderNodeTexEnvironment")
    hdri_path = POLY / hdri / f"{hdri}_1k.hdr"
    if not hdri_path.exists():
        raise RuntimeError(f"Missing required HDRI: {hdri_path}")
    env.image = bpy.data.images.load(str(hdri_path), check_existing=True)
    bg.inputs["Strength"].default_value = 0.45
    links.new(env.outputs["Color"], bg.inputs["Color"])
    links.new(bg.outputs["Background"], output.inputs["Surface"])

    background = collection("BACKGROUND")
    foreground = collection("FOREGROUND")
    deliberate_tints = {
        "dark_rock_02": (0.42, 0.46, 0.50),
        "slate_floor_03": (0.32, 0.39, 0.44),
        "granite_tile_04": (0.58, 0.60, 0.62),
        "sandstone_cracks": (0.72, 0.56, 0.36),
        "terrazzo_tiles": (0.54, 0.46, 0.42),
    }
    material = pbr(asset, tint=(0.86, 0.55, 0.16) if brass else deliberate_tints.get(asset))
    cube("Floor", (0, 1.5, -0.25), (9, 8, 0.25), material, background, 0)
    cube("Backdrop", (0, 5.5, 4), (9, 0.2, 5), material, background, 0)

    bpy.ops.object.camera_add(location=(0, -15, 3.4))
    camera = bpy.context.object
    camera.name = "CAMERA"
    camera.data.lens = 58
    aim(camera)
    scene.camera = camera

    bpy.ops.object.empty_add(type="PLAIN_AXES", location=(0, 0.2, 2.55))
    anchor = bpy.context.object
    anchor.name = "PRODUCT_ANCHOR"
    anchor["product_scale"] = 0.62
    anchor["product_rotation"] = 0.0

    bpy.ops.object.light_add(type="AREA", location=(-4.5, -3.5, 7))
    key_light = bpy.context.object
    key_light.name = "KEY"
    key_light.data.energy = 900
    key_light.data.shape = "DISK"
    key_light.data.size = 4.5
    aim(key_light, (0, 0, 2.4))
    bpy.ops.object.light_add(type="AREA", location=(4, -1, 4.5))
    fill = bpy.context.object
    fill.name = "FILL"
    fill.data.energy = 450
    fill.data.size = 4
    aim(fill, (0, 0.5, 2.4))
    return scene, background, foreground, material, camera, anchor, key_light, fill


def build_marble(ctx):
    _, bg, fg, mat, cam, anchor, key_light, _ = ctx
    left = cube("Left split gate", (-1.45, 0.5, 3), (1.4, 0.7, 3.5), mat, fg)
    right = cube("Right split gate", (1.45, 0.5, 3), (1.4, 0.7, 3.5), mat, fg)
    key_vec(left, 0, "location", (-1.45, 0.5, 3)); key_vec(left, 45, "location", (-4.5, 0.5, 3))
    key_vec(right, 0, "location", (1.45, 0.5, 3)); key_vec(right, 45, "location", (4.5, 0.5, 3))
    cylinder("Hero dais", (0, 0.7, 0.1), 2.6, 0.35, mat, bg)
    animate_camera(cam, [(0, (0, -17, 3.4), (0, .5, 2.7)), (299, (0, -12.8, 3.2), (0, .5, 2.7))])
    anchor["product_scale"] = .62


def build_basalt(ctx):
    _, bg, fg, mat, cam, anchor, key_light, fill = ctx
    pedestal = cylinder("Rising basalt pedestal", (0, .5, -2.2), 2.3, 1.0, mat, bg)
    key_vec(pedestal, 0, "location", (0, .5, -2.2)); key_vec(pedestal, 95, "location", (0, .5, .05))
    key_vec(anchor, 0, "location", (0, .1, .25)); key_vec(anchor, 95, "location", (0, .1, 1.82))
    key(key_light.data, 0, "energy", 180); key(key_light.data, 210, "energy", 1450)
    key(fill.data, 0, "energy", 120); key(fill.data, 210, "energy", 620)
    animate_camera(cam, [(0, (0, -15.5, 2.2), (0, .5, 2)), (299, (0, -12.5, 1.7), (0, .5, 2.5))])
    cube("Near basalt", (-4.5, -1, 2), (1.2, .8, 3), mat, fg)


def build_slate(ctx):
    _, bg, fg, mat, cam, anchor, *_ = ctx
    for i in range(8):
        angle = i * math.tau / 8
        fin = cube(f"Iris fin {i:02}", (math.cos(angle)*4.15, 1.2, 3+math.sin(angle)*4.15),
                   (.38, .28, 1.65), mat, fg)
        fin.rotation_euler.y = -angle
        key_vec(fin, 0, "rotation_euler", (0, -angle, angle + .58))
        key_vec(fin, 110, "rotation_euler", (0, -angle, angle + .08))
    torus("Completed slate frame", (0, 1.8, 3), 4.15, .24, mat, bg)
    cylinder("Slate hero stage", (0, .65, .02), 2.25, .28, mat, bg)
    animate_camera(cam, [(0, (0, -16.2, 3.2), (0, 1, 3)), (299, (0, -13.8, 3.15), (0, 1, 3))])


def build_granite(ctx):
    _, bg, fg, mat, cam, anchor, *_ = ctx
    for i, x in enumerate((-5.8, -3.5, 3.5, 5.8)):
        target = fg if abs(x) > 5 else bg
        cube(f"Tracking column {i}", (x, 1.4, 3.2), (.48, .65, 3.9), mat, target)
    cylinder("Granite hero plinth", (0, .7, .0), 2.25, .32, mat, bg)
    animate_camera(cam, [(0, (-3.4, -15.2, 3.15), (0, 1, 2.6)), (190, (3.0, -13.4, 3.25), (0, 1, 2.6)), (299, (0, -12.9, 3.2), (0, 1, 2.6))])


def build_sandstone(ctx):
    scene, bg, fg, mat, cam, anchor, key_light, fill = ctx
    scene.world.node_tree.nodes.get("Background").inputs["Strength"].default_value = .18
    key_light.data.energy = 520
    fill.data.energy = 120
    for i, x in enumerate((-4.5, -2.6, 2.6, 4.5)):
        cube(f"Fixed sundial fin {i}", (x, 1.6, 3.0), (.32, .7, 3.8), mat, fg if abs(x)>4 else bg)
    cylinder("Sandstone dial", (0, .7, .0), 2.5, .24, mat, bg)
    key_vec(key_light, 0, "location", (-7, -4, 5)); key_vec(key_light, 210, "location", (6, -4, 4))
    animate_camera(cam, [(0, (-2.2, -14.8, 3.4), (0, .5, 2.6)), (240, (2.2, -14.5, 3.4), (0, .5, 2.6)), (299, (1, -14, 3.3), (0, .5, 2.6))])


def build_steel(ctx):
    _, bg, fg, mat, cam, anchor, *_ = ctx
    left = cube("Compressing left wall", (-5.5, .5, 3), (1.3, 1, 3.8), mat, fg)
    right = cube("Compressing right wall", (5.5, .5, 3), (1.3, 1, 3.8), mat, fg)
    for frame, x in ((0, 5.5), (110, 3.3), (180, 3.3), (250, 5.3), (299, 5.5)):
        key_vec(left, frame, "location", (-x, .5, 3)); key_vec(right, frame, "location", (x, .5, 3))
    cylinder("Steel stage", (0, .4, .08), 2.5, .35, mat, bg)
    animate_camera(cam, [(0, (0, -15.5, 3.3), (0, .5, 2.5)), (180, (0, -12.8, 3.2), (0, .5, 2.5)), (299, (0, -14.5, 3.4), (0, .5, 2.5))])


def build_terrazzo(ctx):
    _, bg, fg, mat, cam, anchor, *_ = ctx
    for i, radius in enumerate((2.7, 3.8, 4.9)):
        ring = torus(f"Rotating atrium ring {i}", (0, 1.8+i*.3, 3), radius, .15, mat, bg, rotation=(math.pi/2, 0, 0))
        key_vec(ring, 0, "rotation_euler", (0, 0, i*.7)); key_vec(ring, 240, "rotation_euler", (0, 0, (i+1)*math.tau*.6))
    cylinder("Atrium product stage", (0, .5, .05), 2.15, .3, mat, bg)
    animate_camera(cam, [(0, (0, -15.4, 3.2), (0, .8, 2.6)), (240, (0, -13.2, 3.8), (0, .8, 2.6)), (299, (0, -13.0, 3.8), (0, .8, 2.6))])


def cloth_panel(name, side, mat, fg):
    bpy.ops.mesh.primitive_grid_add(x_subdivisions=25, y_subdivisions=35, size=2, location=(side*2.8, 0, 3.4))
    obj = bpy.context.object
    obj.name = name
    obj.scale = (2.2, 1, 3.8)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    obj.rotation_euler = (math.pi/2, 0, 0)
    obj.data.materials.append(mat)
    group = obj.vertex_groups.new(name="PIN")
    top = [v.index for v in obj.data.vertices if v.co.y > .92]
    group.add(top, 1, "REPLACE")
    cloth = obj.modifiers.new("Genuine cloth simulation", "CLOTH")
    cloth.settings.vertex_group_mass = "PIN"
    cloth.settings.quality = 5
    cloth.settings.air_damping = 3
    move_to(obj, fg)
    return obj


def build_velvet(ctx):
    _, bg, fg, mat, cam, anchor, *_ = ctx
    left = cloth_panel("Left cloth curtain", -1, mat, fg)
    right = cloth_panel("Right cloth curtain", 1, mat, fg)
    key_vec(left, 0, "location", (-2.8, 0, 3.4)); key_vec(left, 150, "location", (-5.2, .2, 3.4))
    key_vec(right, 0, "location", (2.8, 0, 3.4)); key_vec(right, 150, "location", (5.2, .2, 3.4))
    cylinder("Theatre stage", (0, .7, .1), 2.6, .35, mat, bg)
    animate_camera(cam, [(0, (0, -15.5, 3.4), (0, .5, 2.6)), (299, (0, -12.8, 3.2), (0, .5, 2.6))])


def build_concrete(ctx):
    _, bg, fg, mat, cam, anchor, *_ = ctx
    for i in range(8):
        x = (-1 if i % 2 == 0 else 1) * (3.2 + (i % 3)*.55)
        block = cube(f"Cascade monolith {i}", (x, 4-i*.7, 2.8), (.7, .8, 3.4), mat, fg if i < 4 else bg)
        start = i * 18
        key_vec(block, start, "location", (x, 4-i*.7, 2.8))
        key_vec(block, start+70, "location", (x*1.45, 4-i*.7, 2.8))
    animate_camera(cam, [(0, (-2.8, -15, 3.2), (0, 1, 2.6)), (210, (2.8, -12.8, 3.5), (1.2, 1, 2.6)), (299, (2, -12.5, 3.4), (1.2, 1, 2.6))])
    key_vec(anchor, 0, "location", (.8, .2, 2.5)); key_vec(anchor, 210, "location", (1.2, .2, 2.5))


def build_brass(ctx):
    _, bg, fg, mat, cam, anchor, key_light, fill = ctx
    for i, radius in enumerate((2.6, 3.5, 4.4)):
        ring = torus(f"Independent brass ring {i}", (0, 1.4, 3), radius, .22, mat, fg if i == 2 else bg)
        key_vec(ring, 0, "rotation_euler", (math.pi/2, i*.65, i*.9))
        key_vec(ring, 230, "rotation_euler", (math.pi/2, 0, 0))
    key_vec(key_light, 0, "location", (-6, -2, 6)); key_vec(key_light, 180, "location", (6, -2, 5))
    key_vec(fill, 0, "location", (5, 1, 3)); key_vec(fill, 180, "location", (-5, 0, 6))
    animate_camera(cam, [(0, (1.8, -15, 3.5), (0, 1, 2.8)), (230, (0, -13.2, 3.3), (0, 1, 2.8)), (299, (0, -13, 3.3), (0, 1, 2.8))])


BUILDERS = {
    "marble-split-gate": build_marble,
    "basalt-pedestal-rise": build_basalt,
    "slate-mechanical-iris": build_slate,
    "granite-tracking-corridor": build_granite,
    "sandstone-sundial": build_sandstone,
    "blue-steel-compression-bay": build_steel,
    "terrazzo-rotating-atrium": build_terrazzo,
    "velvet-proscenium": build_velvet,
    "concrete-monolith-cascade": build_concrete,
    "brass-halo-chamber": build_brass,
}


def export_placement(scene, camera, anchor, destination):
    entries = []
    for frame in range(FRAMES):
        scene.frame_set(frame)
        point = world_to_camera_view(scene, camera, anchor.matrix_world.translation)
        scale = float(anchor.get("product_scale", .34)) * (camera.data.lens / 58)
        entries.append({
            "frame": frame, "x": round(point.x, 6), "y": round(1-point.y, 6),
            "scale": round(scale, 6), "rotation": round(float(anchor.get("product_rotation", 0)), 4),
        })
    destination.write_text(json.dumps(entries, indent=2))


def render_background(scene, bg, fg, destination):
    bg.hide_render = False
    fg.hide_render = True
    scene.render.film_transparent = False
    scene.render.image_settings.file_format = "FFMPEG"
    scene.render.ffmpeg.format = "MPEG4"
    scene.render.ffmpeg.codec = "H264"
    scene.render.ffmpeg.constant_rate_factor = "MEDIUM"
    scene.render.filepath = str(destination / "background.mp4")
    bpy.ops.render.render(animation=True)


def render_foreground(scene, bg, fg, destination):
    bg.hide_render = True
    fg.hide_render = False
    scene.render.film_transparent = True
    foreground = destination / "foreground"
    foreground.mkdir(parents=True, exist_ok=True)
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
    scene.render.filepath = str(foreground) + "/"
    bpy.ops.render.render(animation=True)


def build(design):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    asset, hdri = DESIGNS[design]
    ctx = base_scene(asset, hdri, brass=design == "brass-halo-chamber")
    BUILDERS[design](ctx)
    scene, bg, fg, _, camera, anchor, *_ = ctx
    destination = OUTPUT / design
    destination.mkdir(parents=True, exist_ok=True)
    scene["template_id"] = design
    scene["frame_contract"] = "300 frames at 30 fps"
    bpy.ops.wm.save_as_mainfile(filepath=str(destination / f"{design}.blend"))
    export_placement(scene, camera, anchor, destination / "placement.json")
    render_background(scene, bg, fg, destination)
    render_foreground(scene, bg, fg, destination)


def main():
    choice = sys.argv[sys.argv.index("--") + 1] if "--" in sys.argv else "all"
    selected = list(DESIGNS) if choice == "all" else [choice]
    unknown = [item for item in selected if item not in DESIGNS]
    if unknown:
        raise SystemExit(f"Unknown design(s): {unknown}")
    for design in selected:
        print(f"BUILD_RENDER {design}", flush=True)
        build(design)


if __name__ == "__main__":
    main()
