"""Run with Blender --background --python scripts/build-product-knife.py.

Creates the editable source, an animated glTF binary, and a transparent poster.
All geometry is built in Blender; no external assets or add-ons are required.
"""
from pathlib import Path
import math
import random
import bpy
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[1]
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

def material(name, color, metallic=0, roughness=.35):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*color, 1)
    mat.use_nodes = True
    shader = mat.node_tree.nodes.get('Principled BSDF')
    shader.inputs['Base Color'].default_value = (*color, 1)
    shader.inputs['Metallic'].default_value = metallic
    shader.inputs['Roughness'].default_value = roughness
    return mat

def srgb(hex_color):
    return tuple(((int(hex_color[i:i+2], 16)/255+.055)/1.055)**2.4 for i in (0, 2, 4))

blue = material('Product blue • #297CDB • soft-touch polymer', srgb('297CDB'), 0, .36)
blue.node_tree.nodes.get('Principled BSDF').inputs['Specular IOR Level'].default_value = .26
steel = material('Longitudinal brushed stainless steel', (.48, .51, .56), 1, .3)
edge = material('Polished cutting edges', (.66, .70, .76), 1, .17)
dark = material('Graphite spacers', (.012, .018, .029), .65, .33)

# A packed micro-normal texture survives glTF export, unlike shader noise nodes.
rng = random.Random(42)
grain = bpy.data.images.new('Soft-touch micrograin', width=256, height=256, alpha=False)
grain.colorspace_settings.name = 'Non-Color'
pixels = []
for _ in range(256*256):
    pixels.extend((.5+rng.uniform(-.22,.22), .5+rng.uniform(-.22,.22), 1, 1))
grain.pixels = pixels
grain.pack()
nodes = blue.node_tree.nodes
tex = nodes.new('ShaderNodeTexImage')
tex.image = grain
normal = nodes.new('ShaderNodeNormalMap')
normal.inputs['Strength'].default_value = .28
blue.node_tree.links.new(tex.outputs['Color'], normal.inputs['Color'])
blue.node_tree.links.new(normal.outputs['Normal'], nodes.get('Principled BSDF').inputs['Normal'])

brush = bpy.data.images.new('Fine linear brushed steel', width=256, height=256, alpha=False)
brush.colorspace_settings.name = 'Non-Color'
brush_pixels = []
for y in range(256):
    line = rng.uniform(-.14,.14)
    for x in range(256):
        brush_pixels.extend((.5+rng.uniform(-.008,.008), .5+line, 1, 1))
brush.pixels = brush_pixels
brush.pack()
brush_tex = steel.node_tree.nodes.new('ShaderNodeTexImage')
brush_tex.image = brush
brush_normal = steel.node_tree.nodes.new('ShaderNodeNormalMap')
brush_normal.inputs['Strength'].default_value = .16
steel.node_tree.links.new(brush_tex.outputs['Color'], brush_normal.inputs['Color'])
steel.node_tree.links.new(brush_normal.outputs['Normal'], steel.node_tree.nodes.get('Principled BSDF').inputs['Normal'])

root = bpy.data.objects.new('Product knife', None)
bpy.context.collection.objects.link(root)
root.rotation_euler.z = math.radians(30)

def finish(obj, name, mat, bevel=.04, parent=root):
    obj.name = name
    obj.data.materials.append(mat)
    if parent:
        obj.parent = parent
    if bevel:
        mod = obj.modifiers.new('Machined rounded edges', 'BEVEL')
        mod.width = bevel
        mod.segments = 3
        bpy.context.view_layer.objects.active = obj
        bpy.ops.object.modifier_apply(modifier=mod.name)
    for face in obj.data.polygons:
        face.use_smooth = True
    mod = obj.modifiers.new('Weighted surface normals', 'WEIGHTED_NORMAL')
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.modifier_apply(modifier=mod.name)
    return obj

def prism(name, points, depth, z, mat, bevel=.03, parent=root):
    n = len(points)
    verts = [(x,y,z-depth/2) for x,y in points]+[(x,y,z+depth/2) for x,y in points]
    faces = [tuple(reversed(range(n))), tuple(range(n,2*n))]
    faces += [(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)]
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.mesh.normals_make_consistent(inside=False)
    bpy.ops.uv.smart_project()
    bpy.ops.object.mode_set(mode='OBJECT')
    obj.select_set(False)
    if mat == steel:
        # Consistent fine brushing in each tool's local longitudinal direction.
        for loop in mesh.loops:
            co = mesh.vertices[loop.vertex_index].co
            mesh.uv_layers.active.data[loop.index].uv = (co.x*3,co.y*3)
    return finish(obj, name, mat, bevel, parent)

def capsule(name, length, width, depth, z, mat, bevel=.04):
    r = width/2
    c = length/2-r
    points = []
    for center, start in ((c,-math.pi/2),(-c, math.pi/2)):
        points += [(center+r*math.cos(start+i*math.pi/24),r*math.sin(start+i*math.pi/24)) for i in range(25)]
    return prism(name, points, depth, z, mat, bevel)

def sculpted_scale(name, front=True):
    """A continuous domed surface, with a rolled edge and planar mounting face."""
    radius, center = .72, 1.62
    contour = []
    for c, start in ((center,-math.pi/2),(-center,math.pi/2)):
        contour += [(c+radius*math.cos(start+i*math.pi/32),radius*math.sin(start+i*math.pi/32)) for i in range(33)]
    profile = [(1,.29),(1.01,.34),(.995,.44),(.955,.53),(.87,.61),(.65,.67),(.34,.70),(.035,.71)]
    count = len(contour)
    verts = [(x*s,y*s,z if front else -z) for s,z in profile for x,y in contour]
    faces = [tuple(reversed(range(count)))]
    for ring_index in range(len(profile)-1):
        a, b = ring_index*count, (ring_index+1)*count
        faces += [(a+i,a+(i+1)%count,b+(i+1)%count,b+i) for i in range(count)]
    faces.append(tuple(range((len(profile)-1)*count,len(profile)*count)))
    if not front:
        faces = [tuple(reversed(f)) for f in faces]
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    uv = mesh.uv_layers.new(name='Surface grain UV')
    for face in mesh.polygons:
        face.use_smooth = True
        for loop_index in face.loop_indices:
            co = mesh.vertices[mesh.loops[loop_index].vertex_index].co
            uv.data[loop_index].uv = (co.x*1.8, co.y*1.8)
    obj = bpy.data.objects.new(name,mesh)
    bpy.context.collection.objects.link(obj)
    obj.parent = root
    obj.data.materials.append(blue)
    return obj

for z in (-.28, -.13, .04, .21):
    capsule('Steel liner', 4.63, 1.31, .055, z, steel, .02)
for z in (-.205, -.045, .125):
    capsule('Tool channel', 4.48, 1.22, .08, z, dark, .025)
sculpted_scale('Sculpted back blue scale', False)
sculpted_scale('Sculpted front blue scale')

def cylinder(name, location, radius, depth, mat, parent=root):
    bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=radius, depth=depth, location=location)
    return finish(bpy.context.object, name, mat, .025, parent)

for x in (-1.72, 1.72):
    cylinder('Recessed pivot washer', (x,0,.621), .196, .03, dark)
    cylinder('Machined pivot rim', (x,0,.642), .171, .055, edge)
    cylinder('Satin pivot face', (x,0,.672), .14, .012, steel)
    bpy.ops.mesh.primitive_torus_add(major_segments=48, minor_segments=6, location=(x,0,.681), major_radius=.145, minor_radius=.005)
    finish(bpy.context.object, 'Circular machining line', dark, 0)

def pivot(name, x, z, closed, opened, delay=0):
    obj = bpy.data.objects.new(name, None)
    bpy.context.collection.objects.link(obj)
    obj.parent = root
    obj.location = (x,0,z)
    for frame, angle in ((1,closed),(1+delay,closed),(34+delay,opened),(90,opened)):
        obj.rotation_euler.z = math.radians(angle)
        obj.keyframe_insert(data_path='rotation_euler', frame=frame, group='Unfold')
    return obj

blade = pivot('Blade hinge', -1.72, .11, 0, 107)
prism('Main blade', [(-.16,-.23),(.23,-.40),(2.02,-.40),(2.60,-.25),(3.15,.14),(2.65,.38),(1.9,.45),(.20,.42),(-.16,.22)], .105, 0, steel, .032, blade)
prism('Honed blade bevel', [(.27,-.397),(2.02,-.397),(2.60,-.25),(3.15,.14),(2.51,-.10),(1.97,-.24),(.27,-.24)], .013, .065, edge, .007, blade)
prism('Blade nail nick', [(.65,.28),(1.57,.30),(1.68,.35),(.74,.355)], .011, .067, dark, .016, blade)

opener = pivot('Bottle opener hinge', 1.72, -.19, 180, 61, 7)
prism('Bottle opener', [(-.18,-.25),(1.82,-.31),(2.03,-.20),(2.07,.05),(1.77,.05),(1.71,-.075),(1.39,-.075),(1.23,.09),(1.25,.26),(1.40,.35),(2.04,.35),(1.98,.57),(1.70,.64),(1.08,.57),(.32,.24),(-.18,.22)], .14, 0, steel, .038, opener)

driver = pivot('Screwdriver hinge', 1.72, -.03, 180, 291, 11)
prism('Flathead screwdriver', [(-.15,-.17),(1.42,-.16),(1.82,-.25),(2.16,-.21),(2.16,.21),(1.82,.25),(1.42,.16),(-.15,.17)], .15, 0, steel, .027, driver)
prism('Driver tip bevel', [(1.85,-.24),(2.16,-.21),(2.16,.21),(1.85,.24)], .032, .082, edge, .01, driver)

scissors = pivot('Scissors hinge', 1.72, -.35, 180, 116, 4)
for sign in (-1,1):
    points = [(-.12,-.15),(.65,-.15),(1.22,-.12),(3.03,.50),(2.43,.47),(1.12,.19),(.63,.17),(-.12,.15)]
    points = [(x,y*sign) for x,y in points]
    if sign == -1:
        points.reverse()
    prism('Scissor half '+str(sign), points, .08, sign*.055, steel, .027, scissors)
cylinder('Scissors axle washer', (1.18,0,.13), .177, .03, dark, scissors)
cylinder('Scissors axle', (1.18,0,.16), .145, .07, edge, scissors)
# Bowed leaf spring bridges the two arms below their working pivot.
spring_points = [(.25,.21),(.46,.29),(.71,.28),(.96,.15),(.92,.11),(.69,.22),(.47,.23),(.26,.16)]
prism('Scissors leaf spring', spring_points, .052, .12, edge, .012, scissors)

# Keyring hangs from the rear end and adds a familiar pocket-tool detail.
cylinder('Keyring anchor', (2.36,-.04,-.12), .15, .07, steel)
bpy.ops.mesh.primitive_torus_add(major_segments=48, minor_segments=10, location=(2.69,-.09,-.12), major_radius=.31, minor_radius=.042)
ring = finish(bpy.context.object, 'Split keyring', steel, 0)
ring.rotation_euler.x = math.radians(24)

scene = bpy.context.scene
scene.frame_start = 1
scene.frame_end = 90
scene.render.fps = 60
scene.frame_set(55)
scene.world.use_nodes = True
scene.world.node_tree.nodes.get('Background').inputs['Color'].default_value = (.08,.10,.14,1)
scene.world.node_tree.nodes.get('Background').inputs['Strength'].default_value = .25
scene.render.engine = 'CYCLES'
scene.cycles.samples = 96
scene.cycles.use_denoising = True
scene.render.film_transparent = True
scene.render.resolution_x = 1200
scene.render.resolution_y = 800
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGBA'
scene.view_settings.view_transform = 'Standard'
scene.view_settings.look = 'None'
scene.view_settings.exposure = -.35

def aim(obj, target):
    obj.rotation_euler = (Vector(target)-obj.location).to_track_quat('-Z','Y').to_euler()

bpy.ops.object.camera_add(location=(0,-7.5,18))
camera = bpy.context.object
camera.name = 'Presentation camera'
camera.data.type = 'ORTHO'
camera.data.ortho_scale = 9.2
aim(camera, (-.35,.65,0))
scene.camera = camera
for name, loc, power, size in [('Key softbox',(-3,-2,7),550,5),('Silver edge strip',(3,4,4),380,3),('Low fill',(-1,-5,3),55,4)]:
    bpy.ops.object.light_add(type='AREA', location=loc)
    light = bpy.context.object
    light.name = name
    light.data.energy = power
    light.data.shape = 'RECTANGLE'
    light.data.size = size
    light.data.size_y = size*.55
    aim(light, (0,0,0))

for area in bpy.context.screen.areas:
    if area.type == 'VIEW_3D':
        area.spaces.active.region_3d.view_perspective = 'CAMERA'

blend_path = ROOT/'assets/3d/product-swiss-army-knife.blend'
glb_path = ROOT/'site/public/models/product-swiss-army-knife.glb'
blend_path.parent.mkdir(parents=True, exist_ok=True)
glb_path.parent.mkdir(parents=True, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=str(blend_path))
bpy.ops.object.select_all(action='DESELECT')
root.select_set(True)
for obj in root.children_recursive:
    obj.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(glb_path), export_format='GLB', use_selection=True, export_animations=True, export_animation_mode='SCENE', export_frame_range=True)
scene.render.filepath = str(ROOT/'site/public/images/product-knife-poster.png')
bpy.ops.render.render(write_still=True)
print('Saved Blender source, animated GLB and transparent poster.')
