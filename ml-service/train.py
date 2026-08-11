import tensorflow as tf
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras import layers, models
import json

IMG_SIZE = (224, 224)
BATCH_SIZE = 8
NUM_CLASSES = 12

# Data augmentation for training (helps compensate for small dataset)
train_datagen = ImageDataGenerator(
    rescale=1./255,
    rotation_range=20,
    zoom_range=0.2,
    horizontal_flip=True,
    width_shift_range=0.1,
    height_shift_range=0.1
)
val_datagen = ImageDataGenerator(rescale=1./255)

train_gen = train_datagen.flow_from_directory(
    '../data/train', target_size=IMG_SIZE, batch_size=BATCH_SIZE, class_mode='categorical'
)
val_gen = val_datagen.flow_from_directory(
    '../data/val', target_size=IMG_SIZE, batch_size=BATCH_SIZE, class_mode='categorical'
)

# Save the label mapping so app.py knows index -> species name
with open('class_labels.json', 'w') as f:
    json.dump(train_gen.class_indices, f)
print("Classes found:", train_gen.class_indices)

# Load pretrained MobileNetV2, freeze its weights (transfer learning)
base_model = MobileNetV2(input_shape=(224, 224, 3), include_top=False, weights='imagenet')
base_model.trainable = False

model = models.Sequential([
    base_model,
    layers.GlobalAveragePooling2D(),
    layers.Dense(128, activation='relu'),
    layers.Dropout(0.3),
    layers.Dense(NUM_CLASSES, activation='softmax')
])

model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
model.summary()

history = model.fit(train_gen, validation_data=val_gen, epochs=15)

model.save('model/classifier.h5')
print("\n Training complete. Model saved to model/classifier.h5")
print(f"Final validation accuracy: {history.history['val_accuracy'][-1]:.2%}")