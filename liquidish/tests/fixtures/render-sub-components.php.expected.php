<div>
    <div class="flex flex-col gap-4"
        data-foo="bar"
        data-bar="baz"
        wire:ignore
        @click="console.log('clicked')">
        <h1 class="text-2xl"><?php echo $SLOT_VARIABLE; ?></h1>
    </div>
    <?php if ($show) : ?>
        <p>It's show time!</p>
    <?php endif; ?>
</div>
